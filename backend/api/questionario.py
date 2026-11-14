"""Carga e cálculo das jornadas do questionário de triagem."""

import json
from pathlib import Path


ARQUIVO_PERGUNTAS = Path(__file__).with_name("questionario.json")

with ARQUIVO_PERGUNTAS.open(encoding="utf-8") as arquivo:
    PERGUNTAS = json.load(arquivo)["perguntas"]

JORNADAS = ["cardiaca", "sono", "respiratoria"]

_INDICE = {
    pergunta["id"]: {
        opcao["id"]: {opcao["jornada"]: 1}
        for opcao in pergunta["opcoes"]
    }
    for pergunta in PERGUNTAS
}


def calcular_jornada_recomendada(
    respostas: dict[str, str], jornada_escolhida: str | None = None
) -> dict:
    pontuacao = {jornada: 0 for jornada in JORNADAS}

    for pergunta_id, opcao_id in respostas.items():
        pergunta_id = str(pergunta_id)
        if pergunta_id not in _INDICE:
            raise ValueError(f"Pergunta '{pergunta_id}' não encontrada.")
        opcoes_da_pergunta = _INDICE[pergunta_id]
        if opcao_id not in opcoes_da_pergunta:
            raise ValueError(f"Opção '{opcao_id}' inválida para a pergunta '{pergunta_id}'.")
        for jornada, pontos in opcoes_da_pergunta[opcao_id].items():
            pontuacao[jornada] += pontos

    pontuacao_maxima = max(pontuacao.values())
    jornadas_vencedoras = [
        jornada for jornada, pontos in pontuacao.items()
        if pontos == pontuacao_maxima
    ]
    empate = len(jornadas_vencedoras) > 1
    if empate and jornada_escolhida is None:
        jornada_recomendada = None
    elif jornada_escolhida is not None:
        if jornada_escolhida not in jornadas_vencedoras:
            raise ValueError("A jornada escolhida não faz parte do empate.")
        jornada_recomendada = jornada_escolhida
    else:
        jornada_recomendada = jornadas_vencedoras[0]

    mensagens = {
        "cardiaca": "Com base nas suas respostas, a Jornada Cardíaca é a mais indicada para você. Vamos juntos cuidar do seu coração! 💚",
        "sono": "Com base nas suas respostas, a Jornada do Sono é a mais indicada para você. Um bom descanso transforma tudo! 💚",
        "respiratoria": "Com base nas suas respostas, a Jornada Respiratória é a mais indicada para você. Respire bem e viva melhor! 💚",
    }

    return {
        "jornada_recomendada": jornada_recomendada,
        "pontuacao": pontuacao,
        "empate": empate,
        "jornadas_empatadas": jornadas_vencedoras if empate else [],
        "mensagem": mensagens.get(jornada_recomendada, "Escolha uma das jornadas empatadas para continuar."),
    }