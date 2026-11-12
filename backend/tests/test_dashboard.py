import pytest

from api import models
from api.main import app
from api.dependencias import usuario_atual

@pytest.fixture
def usuario_teste(db_test):
    """Cria um usuário fictício no banco de testes."""

    usuario = models.User(
        id=900001,
        nome="Usuário Dashboard Teste",
        email="dashboard.pytest@example.com",
        sexo="Outro / Prefiro não informar",
        provider="LOCAL",
        token_version=0,
        email_verificado=True,
    )

    db_test.add(usuario)
    db_test.flush()

    return usuario

@pytest.fixture
def cliente_autenticado(client_test, usuario_teste):
    """Simula a autenticação de um usuário."""

    app.dependency_overrides[usuario_atual] = (
        lambda: usuario_teste
    )

    yield client_test

def criar_jornada(cliente, codigo="introducao-python"):
    """Função auxiliar para iniciar uma jornada."""

    return cliente.post(
        "/dashboard/jornadas",
        json={
            "codigo": codigo,
            "nome": "Introdução ao Python",
        },
    )

def test_dashboard_sem_autenticacao(client_test):
    resposta = client_test.get("/dashboard")

    assert resposta.status_code == 401

def test_dashboard_inicial_vazio(cliente_autenticado):
    resposta = cliente_autenticado.get("/dashboard")
    assert resposta.status_code == 200
    dados = resposta.json()

    assert dados["diasAprendidos"] == 0
    assert dados["progressoSemanal"] == [False] * 7
    assert dados["xpHistorico"] == [0, 0, 0]
    assert dados["jornadas"] == 0
    assert dados["minutos"] == 0

def test_criar_jornada(cliente_autenticado):
    resposta = criar_jornada(cliente_autenticado)
    assert resposta.status_code == 201
    dados = resposta.json()

    assert dados["codigo"] == "introducao-python"
    assert dados["nome"] == "Introdução ao Python"
    assert dados["id"] > 0

def test_listar_jornadas(cliente_autenticado):
    criar_jornada(cliente_autenticado)

    resposta = cliente_autenticado.get(
        "/dashboard/jornadas"
    )

    assert resposta.status_code == 200
    assert len(resposta.json()) == 1
    assert (
        resposta.json()[0]["codigo"]
        == "introducao-python"
    )

def test_impedir_jornada_duplicada(cliente_autenticado):
    primeira = criar_jornada(cliente_autenticado)
    segunda = criar_jornada(cliente_autenticado)

    assert primeira.status_code == 201
    assert segunda.status_code == 409

def test_registrar_atividade(cliente_autenticado):
    jornada = criar_jornada(cliente_autenticado).json()

    resposta = cliente_autenticado.post(
        "/dashboard/atividades",
        json={
            "jornada_id": jornada["id"],
            "referencia": "python-aula-01",
            "xp": 100,
            "minutos": 30,
        },
    )

    assert resposta.status_code == 201
    dados = resposta.json()

    assert dados["xp"] == 100
    assert dados["minutos"] == 30
    assert dados["jornada_id"] == jornada["id"]

def test_impedir_atividade_duplicada(cliente_autenticado):
    jornada = criar_jornada(cliente_autenticado).json()

    atividade = {
        "jornada_id": jornada["id"],
        "referencia": "python-aula-01",
        "xp": 100,
        "minutos": 30,
    }

    primeira = cliente_autenticado.post(
        "/dashboard/atividades",
        json=atividade,
    )

    segunda = cliente_autenticado.post(
        "/dashboard/atividades",
        json=atividade,
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 409

def test_dashboard_atualiza_indicadores(cliente_autenticado):
    jornada = criar_jornada(cliente_autenticado).json()

    resposta_atividade = cliente_autenticado.post(
        "/dashboard/atividades",
        json={
            "jornada_id": jornada["id"],
            "referencia": "python-aula-01",
            "xp": 100,
            "minutos": 30,
        },
    )

    assert resposta_atividade.status_code == 201
    resposta = cliente_autenticado.get("/dashboard")
    assert resposta.status_code == 200
    dados = resposta.json()

    assert dados["diasAprendidos"] == 1
    assert dados["jornadas"] == 1
    assert dados["minutos"] == 30
    assert dados["xpHistorico"][-1] == 100
    assert sum(dados["progressoSemanal"]) == 1

def test_concluir_jornada(cliente_autenticado):
    jornada = criar_jornada(cliente_autenticado).json()

    resposta = cliente_autenticado.patch(
        f"/dashboard/jornadas/{jornada['id']}/concluir"
    )

    assert resposta.status_code == 200
    assert resposta.json()["concluida_em"] is not None

def test_impedir_atividade_em_jornada_concluida(
    cliente_autenticado,
):
    jornada = criar_jornada(cliente_autenticado).json()

    conclusao = cliente_autenticado.patch(
        f"/dashboard/jornadas/{jornada['id']}/concluir"
    )

    assert conclusao.status_code == 200

    resposta = cliente_autenticado.post(
        "/dashboard/atividades",
        json={
            "jornada_id": jornada["id"],
            "referencia": "atividade-apos-conclusao",
            "xp": 50,
            "minutos": 15,
        },
    )

    assert resposta.status_code == 409

def test_concluir_jornada_inexistente(cliente_autenticado):
    resposta = cliente_autenticado.patch(
        "/dashboard/jornadas/999999999/concluir"
    )

    assert resposta.status_code == 404

def test_atividade_em_jornada_inexistente(
    cliente_autenticado,
):
    resposta = cliente_autenticado.post(
        "/dashboard/atividades",
        json={
            "jornada_id": 999999999,
            "referencia": "atividade-invalida",
            "xp": 100,
            "minutos": 30,
        },
    )

    assert resposta.status_code == 404


def test_usuario_nao_pode_concluir_jornada_de_outro(
    cliente_autenticado,
    db_test,
):
    """Impede a conclusão de uma jornada de outro usuário."""

    outro_usuario = models.User(
        id=900002,
        nome="Outro Usuário Teste",
        email="outro.dashboard.pytest@example.com",
        sexo="Outro / Prefiro não informar",
        provider="LOCAL",
        token_version=0,
        email_verificado=True,
    )

    db_test.add(outro_usuario)
    db_test.flush()

    jornada = models.JornadaUsuario(
        usuario_id=outro_usuario.id,
        codigo="jornada-privada",
        nome="Jornada Privada",
    )

    db_test.add(jornada)
    db_test.flush()

    resposta = cliente_autenticado.patch(
        f"/dashboard/jornadas/{jornada.id}/concluir"
    )

    assert resposta.status_code == 404
    assert jornada.concluida_em is None


def test_usuario_nao_pode_registrar_atividade_em_jornada_de_outro(
    cliente_autenticado,
    db_test,
):
    """Impede registrar atividades na jornada de outro usuário."""

    outro_usuario = models.User(
        id=900002,
        nome="Outro Usuário Teste",
        email="outro.dashboard.pytest@example.com",
        sexo="Outro / Prefiro não informar",
        provider="LOCAL",
        token_version=0,
        email_verificado=True,
    )

    db_test.add(outro_usuario)
    db_test.flush()

    jornada = models.JornadaUsuario(
        usuario_id=outro_usuario.id,
        codigo="jornada-privada",
        nome="Jornada Privada",
    )

    db_test.add(jornada)
    db_test.flush()

    resposta = cliente_autenticado.post(
        "/dashboard/atividades",
        json={
            "jornada_id": jornada.id,
            "referencia": "atividade-privada",
            "xp": 100,
            "minutos": 30,
        },
    )

    assert resposta.status_code == 404

    atividade = (
        db_test.query(models.AtividadeAprendizado)
        .filter(
            models.AtividadeAprendizado.referencia
            == "atividade-privada"
        )
        .first()
    )

    assert atividade is None
