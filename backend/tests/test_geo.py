import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api.geo import haversine_km


def test_haversine_mesmo_ponto():
    assert haversine_km(-30.0346, -51.2177, -30.0346, -51.2177) == 0


def test_haversine_retorna_distancia_positiva():
    distancia = haversine_km(-30.0346, -51.2177, -30.0277, -51.2287)
    assert 1 < distancia < 2
