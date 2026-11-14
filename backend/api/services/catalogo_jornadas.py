from math import ceil

JORNADAS = {
    "cardiaca": {
        "nome": "Jornada Cardíaca",
        "episodios": {
            "xjea2uaogqi",
            "hzedusxt9cu",
            "tjhguf9jbzk",
            "qfsm6hhxu50",
            "sey-ks4fb-g",
            "spvp-cy72ui",
        },
    },
    "sono": {
        "nome": "Jornada do Sono",
        "episodios": {
            "lpxdrhtq91a",
            "cpsjc8ozw",
            "9jy4uwp38ui",
        },
    },
    "respiratoria": {
        "nome": "Jornada Respiratória",
        "episodios": {
            "8e18bbal1ac",
            "7u4gu3a-x40",
            "vusjxamq-zc",
            "guye1ajfcpu",
        },
    },
}

XP_POR_AULA = 10

DURACAO_EPISODIOS_SEGUNDOS = {
    "cardiaca": {
        "xjea2uaogqi": 3100,
        "hzedusxt9cu": 239,
        "tjhguf9jbzk": 3434,
        "qfsm6hhxu50": 113,
        "sey-ks4fb-g": 113,
        "spvp-cy72ui": 409,
    },
    "sono": {
        "lpxdrhtq91a": 486,
        "cpsjc8ozw": 308,
        "9jy4uwp38ui": 177,
    },
    "respiratoria": {
        "8e18bbal1ac": 161,
        "7u4gu3a-x40": 368,
        "vusjxamq-zc": 112,
        "guye1ajfcpu": 175,
    },
}


def obter_minutos_episodio(codigo_jornada: str, episodio_id: str) -> int:
    segundos = DURACAO_EPISODIOS_SEGUNDOS[codigo_jornada][episodio_id]
    return ceil(segundos / 60)
