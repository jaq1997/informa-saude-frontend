import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api.questionario import PERGUNTAS, calcular_jornada_recomendada


def respostas_unicas(indice, opcao):
    return {str(indice): opcao}


def test_questionario_tem_nove_perguntas():
    assert len(PERGUNTAS) == 9


def test_calcula_jornada_cardiana():
    resultado = calcular_jornada_recomendada(respostas_unicas(1, "cardiaca"))
    assert resultado["jornada_recomendada"] == "cardiaca"


def test_calcula_jornada_sono():
    resultado = calcular_jornada_recomendada(respostas_unicas(4, "sono"))
    assert resultado["jornada_recomendada"] == "sono"


def test_calcula_jornada_respiratoria():
    resultado = calcular_jornada_recomendada(respostas_unicas(7, "respiratoria"))
    assert resultado["jornada_recomendada"] == "respiratoria"


def test_rejeita_pergunta_inexistente():
    try:
        calcular_jornada_recomendada({"99": "a"})
        assert False, "Uma pergunta inexistente deveria ser rejeitada."
    except ValueError:
        pass
