import json
import logging
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import geo, models, questionario, schemas
from .config import CORS_ORIGINS, EM_PRODUCAO
from .database import get_db, engine as _engine
from .dependencias import usuario_atual
from .routers import auth, cadastro, dashboard, usuarios

logger = logging.getLogger(__name__)

app = FastAPI(
    docs_url=None if EM_PRODUCAO else "/docs",
    redoc_url=None if EM_PRODUCAO else "/redoc",
    openapi_url=None if EM_PRODUCAO else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(cadastro.router)
app.include_router(usuarios.router)
app.include_router(dashboard.router)

# Garante que as tabelas de Estabelecimentos e Resultados existam no PostgreSQL
models.Base.metadata.create_all(bind=_engine)


@app.get("/api/questionario/perguntas")
def listar_perguntas():
    """Retorna as perguntas da triagem para o onboarding do usuário."""
    perguntas_publicas = []
    for p in questionario.PERGUNTAS:
        opcoes = [
            {"id": op["id"], "titulo": op["titulo"], "descricao": op.get("descricao", "")}
            for op in p["opcoes"]
        ]
        perguntas_publicas.append({
            "id": p["id"],
            "titulo": p["titulo"],
            "subtitulo": p["subtitulo"],
            "opcoes": opcoes,
        })
    return perguntas_publicas


@app.post("/api/questionario/resultado", response_model=schemas.QuestionarioResultado)
def processar_questionario(
    dados: schemas.QuestionarioRespostas,
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    """Recebe as respostas do questionário e define a jornada do usuário logado."""
    try:
        resultado = questionario.calcular_jornada_recomendada(
            dados.respostas,
            dados.jornada_escolhida,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    persistido = False
    if resultado["jornada_recomendada"] is not None:
        registro = (
            db.query(models.ResultadoQuestionario)
            .filter(models.ResultadoQuestionario.usuario_id == usuario.id)
            .first()
        )
        if registro:
            registro.respostas = json.dumps(dados.respostas)
            registro.pontuacao = json.dumps(resultado["pontuacao"])
            registro.jornada_recomendada = resultado["jornada_recomendada"]
            registro.criado_em = datetime.now(timezone.utc)
        else:
            registro = models.ResultadoQuestionario(
                usuario_id=usuario.id,
                respostas=json.dumps(dados.respostas),
                pontuacao=json.dumps(resultado["pontuacao"]),
                jornada_recomendada=resultado["jornada_recomendada"],
            )
            db.add(registro)
        db.commit()
        persistido = True

    resultado["persistido"] = persistido
    return resultado


@app.get("/api/mapa/enderecos")
async def buscar_sugestoes_endereco(q: str, limit: int = 5):
    try:
        resultados = await geo.buscar_enderecos(q, limit)
        return [
            {
                "label": item.get("display_name"),
                "lat": float(item["lat"]),
                "lng": float(item["lon"]),
            }
            for item in resultados
            if item.get("display_name") and item.get("lat") and item.get("lon")
        ]
    except Exception as exc:
        logger.warning("Falha ao consultar geocodificação: %s", exc)
        raise HTTPException(status_code=502, detail="Serviço de endereços indisponível")


@app.get("/api/mapa/geocodificar")
async def geocodificar_endereco_mapa(q: str):
    try:
        resultado = await geo.geocodificar_endereco(q)
        if not resultado:
            raise HTTPException(status_code=404, detail="Endereço não encontrado")
        return {
            "label": resultado.get("display_name") or q,
            "lat": float(resultado["lat"]),
            "lng": float(resultado["lon"]),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Falha ao consultar geocodificação: %s", exc)
        raise HTTPException(status_code=502, detail="Serviço de endereços indisponível")


@app.get("/api/estabelecimentos/proximos", response_model=list[schemas.EstabelecimentoResponse])
async def buscar_estabelecimentos_proximos(
    lat: float,
    lng: float,
    raio: float = 10.0,
    tipo: str | None = None,
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    """Busca UPAs e Hospitais dentro do raio informado (em km) a partir do GPS do navegador."""
    query = db.query(models.Estabelecimento).filter(models.Estabelecimento.ativo == True)
    if tipo:
        query = query.filter(models.Estabelecimento.tipo.ilike(tipo.strip()))

    todos = query.all()
    filtrados = await geo.filtrar_por_raio(todos, lat, lng, raio)

    resposta = []
    for est, dist in filtrados:
        resposta.append(schemas.EstabelecimentoResponse(
            id=est.id,
            nome=est.nome,
            tipo=est.tipo,
            endereco=est.endereco,
            bairro=est.bairro,
            cep=est.cep,
            telefone=est.telefone,
            horario_funcionamento=est.horario_funcionamento,
            latitude=float(est.latitude),
            longitude=float(est.longitude),
            codigo_cnes=est.codigo_cnes,
            ativo=est.ativo,
            distancia_km=dist,
        ))
    return resposta


@app.get("/api/estabelecimentos/por-cep", response_model=list[schemas.EstabelecimentoResponse])
async def buscar_estabelecimentos_por_cep(
    cep: str,
    raio: float = 10.0,
    tipo: str | None = None,
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    """Fallback caso o usuário negue a geolocalização: busca pelo CEP via ViaCEP."""
    try:
        lat, lng = await geo.geocodificar_cep(cep)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    query = db.query(models.Estabelecimento).filter(models.Estabelecimento.ativo == True)
    if tipo:
        query = query.filter(models.Estabelecimento.tipo.ilike(tipo.strip()))

    todos = query.all()
    filtrados = await geo.filtrar_por_raio(todos, lat, lng, raio)

    resposta = []
    for est, dist in filtrados:
        resposta.append(schemas.EstabelecimentoResponse(
            id=est.id,
            nome=est.nome,
            tipo=est.tipo,
            endereco=est.endereco,
            bairro=est.bairro,
            cep=est.cep,
            telefone=est.telefone,
            horario_funcionamento=est.horario_funcionamento,
            latitude=float(est.latitude),
            longitude=float(est.longitude),
            codigo_cnes=est.codigo_cnes,
            ativo=est.ativo,
            distancia_km=dist,
        ))
    return resposta
