import os
import sys
from pathlib import Path

import pytest
from dotenv import dotenv_values
from sqlalchemy import text
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

ENV_TEST = BACKEND_DIR / ".env.test"

if not ENV_TEST.is_file():
    raise RuntimeError("Arquivo .env.test não encontrado.")

configuracoes = dotenv_values(ENV_TEST)

if configuracoes.get("DB_NAME") != "informa_saude_test":
    raise RuntimeError(
        "Segurança: os testes exigem informa_saude_test."
    )

for nome in (
    "DB_USER",
    "DB_PASSWORD",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
):
    valor = configuracoes.get(nome)

    if not valor:
        raise RuntimeError(
            f"Variável obrigatória ausente: {nome}"
        )

    os.environ[nome] = valor


from api.database import engine, get_db
from api.main import app



@pytest.fixture
def db_test():
    """Cria uma sessão isolada para cada teste."""

    with engine.connect() as conexao:
        transacao = conexao.begin()

        try:
            banco_atual = conexao.execute(
                text("SELECT current_database()")
            ).scalar_one()

            if banco_atual != "informa_saude_test":
                raise RuntimeError(
                    f"Banco incorreto: {banco_atual}"
                )

            with Session(
                bind=conexao,
                join_transaction_mode="create_savepoint",
                expire_on_commit=False,
            ) as sessao:
                yield sessao

        finally:
            transacao.rollback()


@pytest.fixture
def client_test(db_test):
    """Substitui a sessão da API pela sessão de testes."""

    from fastapi.testclient import TestClient

    def substituir_get_db():
        yield db_test

    app.dependency_overrides[get_db] = substituir_get_db

    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()