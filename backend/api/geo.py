import math
import logging
import httpx

logger = logging.getLogger(__name__)

VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_HEADERS = {
    "User-Agent": "InformaSaude/1.0 (projeto-academico; contato: suporte@informasaude.local)",
    "Accept-Language": "pt-BR",
}
OSRM_TABLE_URL = "https://router.project-osrm.org/table/v1/driving/{coords}"


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula a distância euclidiana/esférica (em linha reta) em km."""
    raio_terra = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return raio_terra * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def geocodificar_cep(cep: str) -> tuple[float, float]:
    """Converte CEP em coordenadas (lat, lng) usando ViaCEP + Nominatim."""
    cep_limpo = cep.replace("-", "").replace(" ", "").strip()
    if len(cep_limpo) != 8 or not cep_limpo.isdigit():
        raise ValueError("CEP inválido. Use o formato 90000-000.")

    async with httpx.AsyncClient(timeout=10) as client:
        resp_cep = await client.get(VIACEP_URL.format(cep=cep_limpo))
        if resp_cep.status_code != 200:
            raise ValueError("CEP não encontrado.")

        dados_cep = resp_cep.json()
        if dados_cep.get("erro"):
            raise ValueError("CEP não encontrado.")

        logradouro = dados_cep.get("logradouro", "")
        bairro = dados_cep.get("bairro", "")
        localidade = dados_cep.get("localidade", "")
        uf = dados_cep.get("uf", "")
        endereco_completo = f"{logradouro}, {bairro}, {localidade}, {uf}, Brasil"

        resp_geo = await client.get(
            NOMINATIM_URL,
            params={
                "q": endereco_completo,
                "format": "json",
                "limit": 1,
                "countrycodes": "br",
            },
            headers=NOMINATIM_HEADERS,
        )
        resultados = resp_geo.json()
        if not resultados:
            resp_geo2 = await client.get(
                NOMINATIM_URL,
                params={
                    "q": f"{localidade}, {uf}, Brasil",
                    "format": "json",
                    "limit": 1,
                    "countrycodes": "br",
                },
                headers=NOMINATIM_HEADERS,
            )
            resultados = resp_geo2.json()

        if not resultados:
            raise ValueError("Não foi possível determinar a localização a partir do CEP.")

        return float(resultados[0]["lat"]), float(resultados[0]["lon"])


async def buscar_enderecos(query: str, limite: int = 5) -> list[dict]:
    termo = query.strip()
    if len(termo) < 3:
        return []

    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        resposta = await client.get(
            NOMINATIM_URL,
            params={
                "q": termo,
                "format": "jsonv2",
                "addressdetails": 1,
                "countrycodes": "br",
                "limit": min(limite, 5),
                "accept-language": "pt-BR",
            },
            headers=NOMINATIM_HEADERS,
        )
        resposta.raise_for_status()
        return resposta.json()


async def geocodificar_endereco(query: str) -> dict | None:
    resultados = await buscar_enderecos(query, limite=1)
    return resultados[0] if resultados else None


async def calcular_distancias_reais_osrm(lat_ref: float, lng_ref: float, estabelecimentos: list) -> list[tuple]:
    """
    Calcula distâncias reais rodoviárias (por ruas e avenidas) utilizando
    o motor de roteamento OSRM (Open Source Routing Machine).
    """
    if not estabelecimentos:
        return []

    # OSRM espera coordenadas no formato: longitude,latitude;longitude,latitude...
    # Origem é o ponto 0
    coordenadas = [f"{lng_ref},{lat_ref}"]
    for est in estabelecimentos:
        coordenadas.append(f"{float(est.longitude)},{float(est.latitude)}")

    coords_str = ";".join(coordenadas)
    # sources=0 calcula as distâncias da Origem (índice 0) para todos os destinos
    destinations = ";".join(str(i) for i in range(1, len(estabelecimentos) + 1))
    url = f"https://router.project-osrm.org/table/v1/driving/{coords_str}?sources=0&destinations={destinations}&annotations=distance"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=NOMINATIM_HEADERS)
            if resp.status_code == 200:
                data = resp.json()
                if "distances" in data and data["distances"] and len(data["distances"][0]) == len(estabelecimentos):
                    distancias_metros = data["distances"][0]
                    resultado = []
                    for est, dist_m in zip(estabelecimentos, distancias_metros):
                        if dist_m is not None:
                            dist_km = round(dist_m / 1000.0, 2)
                        else:
                            # fallback se OSRM não achar rota
                            dist_km = round(haversine_km(lat_ref, lng_ref, float(est.latitude), float(est.longitude)) * 1.25, 2)
                        resultado.append((est, dist_km))
                    return resultado
    except Exception as e:
        logger.warning(f"Falha ao consultar OSRM, usando fallback Haversine com fator viário: {e}")

    # Fallback caso a API do OSRM falhe
    resultado = []
    for est in estabelecimentos:
        dist_reta = haversine_km(lat_ref, lng_ref, float(est.latitude), float(est.longitude))
        # Fator de correção viário típico urbano de POA (~1.25 a 1.3x da linha reta)
        dist_estimada = round(dist_reta * 1.25, 2)
        resultado.append((est, dist_estimada))
    return resultado


async def filtrar_por_raio(estabelecimentos, lat_ref: float, lng_ref: float, raio_km: float):
    """
    Filtra estabelecimentos dentro de uma margem preliminar e calcula
    a distância rodoviária real através do OSRM.
    """
    # 1. Pré-filtro rápido usando Haversine (linha reta com folga de 25%)
    candidatos = []
    for est in estabelecimentos:
        dist_reta = haversine_km(lat_ref, lng_ref, float(est.latitude), float(est.longitude))
        if dist_reta <= raio_km * 1.25:
            candidatos.append(est)

    if not candidatos:
        return []

    # 2. Calcula distâncias reais por ruas via OSRM
    com_distancia_real = await calcular_distancias_reais_osrm(lat_ref, lng_ref, candidatos)

    # 3. Filtra os que realmente estão dentro do raio rodoviário e ordena do mais próximo pro mais distante
    filtrados = [item for item in com_distancia_real if item[1] <= raio_km]
    filtrados.sort(key=lambda x: x[1])
    return filtrados
