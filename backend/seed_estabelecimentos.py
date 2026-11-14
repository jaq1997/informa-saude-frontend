"""
Script para popular o banco de dados com a lista completa de 19 UPAs e Hospitais de Porto Alegre (POA).

Como rodar:
    python seed_estabelecimentos.py
"""

from api.database import SessionLocal, engine, Base
from api.models import Estabelecimento

ESTABELECIMENTOS_POA = [
    {
        "nome": "Hospital São Francisco",
        "tipo": "Hospital",
        "endereco": "Av. Independência, 75",
        "telefone": "+55 51 3214-8000",
        "latitude": "-30.0314655",
        "longitude": "-51.2223542",
        "codigo_cnes": "SF_01",
    },
    {
        "nome": "Hospital Dom Vicente Scherer",
        "tipo": "Hospital",
        "endereco": "Av. Independência, 155",
        "telefone": "+55 51 3214-8000",
        "latitude": "-30.0301233",
        "longitude": "-51.2203282",
        "codigo_cnes": "DVS_02",
    },
    {
        "nome": "Pronto Atendimento Cruzeiro do Sul",
        "tipo": "UPA",
        "endereco": "R. Prof. Manoel Lobato, 151",
        "telefone": "+55 51 3289-4046",
        "latitude": "-30.076328",
        "longitude": "-51.222384",
        "codigo_cnes": "CS_03",
    },
    {
        "nome": "HPS - Hospital de Pronto Socorro",
        "tipo": "Hospital",
        "endereco": "Largo Teodoro Herzl, s/nº",
        "telefone": "+55 51 3289-7999",
        "latitude": "-30.038144",
        "longitude": "-51.213192",
        "codigo_cnes": "HPS_04",
    },
    {
        "nome": "Pronto Atendimento Bom Jesus",
        "tipo": "UPA",
        "endereco": "R. Bom Jesus, 410",
        "telefone": "+55 51 3289-5424",
        "latitude": "-30.046901",
        "longitude": "-51.161118",
        "codigo_cnes": "BJ_05",
    },
    {
        "nome": "UPA Moacyr Scliar",
        "tipo": "UPA",
        "endereco": "R. Jerônymo Zelmanovitz, 01",
        "telefone": "+55 51 3368-1629",
        "latitude": "-30.0097722",
        "longitude": "-51.1458854",
        "codigo_cnes": "MS_06",
    },
    {
        "nome": "Hospital São Lucas da PUCRS Pronto Socorro",
        "tipo": "Hospital",
        "endereco": "Av. Ipiranga, 6690",
        "telefone": "+55 51 3320-3300",
        "latitude": "-30.057391",
        "longitude": "-51.173822",
        "codigo_cnes": "SL_07",
    },
    {
        "nome": "Hospital Restinga e Extremo-Sul",
        "tipo": "Hospital",
        "endereco": "Estr. João Antônio da Silveira, 3700",
        "telefone": "+55 51 3010-4700",
        "latitude": "-30.1424402",
        "longitude": "-51.1288772",
        "codigo_cnes": "RES_08",
    },
    {
        "nome": "Hospital Vila Nova",
        "tipo": "Hospital",
        "endereco": "R. Catarino Andreatta, 155",
        "telefone": "+55 51 2828-0700",
        "latitude": "-30.1194522",
        "longitude": "-51.2077654",
        "codigo_cnes": "VN_09",
    },
    {
        "nome": "Hospital Divina - Rede de Saúde da Divina Providência",
        "tipo": "Hospital",
        "endereco": "R. da Gruta, 145",
        "telefone": "+55 51 3320-6000",
        "latitude": "-30.0848026",
        "longitude": "-51.1878082",
        "codigo_cnes": "DIV_10",
    },
    {
        "nome": "Hospital Santa Ana",
        "tipo": "Hospital",
        "endereco": "Praça Simões Lopes Neto, 175",
        "telefone": "+55 51 3317-8142",
        "latitude": "-30.0870671",
        "longitude": "-51.2065358",
        "codigo_cnes": "SA_11",
    },
    {
        "nome": "HBM Hospital da Brigada Militar de Porto Alegre",
        "tipo": "Hospital",
        "endereco": "R. Dr. Castro de Menezes, 155",
        "telefone": "+55 51 3288-3500",
        "latitude": "-30.0982586",
        "longitude": "-51.2508517",
        "codigo_cnes": "HBM_12",
    },
    {
        "nome": "Hospital Espírita de Porto Alegre",
        "tipo": "Hospital",
        "endereco": "Praça Simões Lopes Neto, 175",
        "telefone": "+55 51 3320-5700",
        "latitude": "-30.0874849",
        "longitude": "-51.2064767",
        "codigo_cnes": "HE_13",
    },
    {
        "nome": "Hospital Santa Clara",
        "tipo": "Hospital",
        "endereco": "Rua Professor Annes Dias, 135",
        "telefone": "+55 51 3214-8080",
        "latitude": "-30.0309367",
        "longitude": "-51.2228893",
        "codigo_cnes": "SC_14",
    },
    {
        "nome": "Hospital Santa Helena",
        "tipo": "Hospital",
        "endereco": "R. Cel. Aparício Borges",
        "telefone": None,
        "latitude": "-30.0772015",
        "longitude": "-51.2063169",
        "codigo_cnes": "SH_15",
    },
    {
        "nome": "Hospital Mãe de Deus",
        "tipo": "Hospital",
        "endereco": "R. José de Alencar, 286",
        "telefone": "+55 51 3230-6000",
        "latitude": "-30.0590315",
        "longitude": "-51.2289574",
        "codigo_cnes": "MD_16",
    },
    {
        "nome": "HPOA - Hospital Porto Alegre",
        "tipo": "Hospital",
        "endereco": "R. Antônio Francisco da Rocha, 100",
        "telefone": "+55 51 3376-4516",
        "latitude": "-30.0453722",
        "longitude": "-51.2168163",
        "codigo_cnes": "HPOA_17",
    },
    {
        "nome": "Hospital Humaniza Hapvida",
        "tipo": "Hospital",
        "endereco": "R. Ramiro Barcelos, 621",
        "telefone": "+55 85 4002-3633",
        "latitude": "-30.0418503",
        "longitude": "-51.2079969",
        "codigo_cnes": "HH_18",
    },
    {
        "nome": "Hospital Ernesto Dornelles",
        "tipo": "Hospital",
        "endereco": "Av. Ipiranga, 1801",
        "telefone": "+55 51 3217-8800",
        "latitude": "-30.0481191",
        "longitude": "-51.2127731",
        "codigo_cnes": "HED_19",
    },
]


def popular_banco():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Iniciando carga dos 19 estabelecimentos de Porto Alegre...")
    inseridos = 0
    atualizados = 0

    try:
        for item in ESTABELECIMENTOS_POA:
            existente = None
            if item.get("codigo_cnes"):
                existente = db.query(Estabelecimento).filter(Estabelecimento.codigo_cnes == item["codigo_cnes"]).first()
            if not existente:
                existente = db.query(Estabelecimento).filter(Estabelecimento.nome == item["nome"]).first()

            if existente:
                for k, v in item.items():
                    setattr(existente, k, v)
                atualizados += 1
            else:
                novo = Estabelecimento(**item)
                db.add(novo)
                inseridos += 1

        db.commit()
        print(f"Sucesso! {inseridos} novos estabelecimentos inseridos, {atualizados} atualizados.")
    except Exception as e:
        db.rollback()
        print(f"Erro ao popular banco: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    popular_banco()
