from datetime import date, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, EmailStr, Field


MAX_BYTES_SENHA = 72


def _minusculo(valor: str) -> str:
    return valor.lower()


def _cabe_no_bcrypt(valor: str) -> str:
    if len(valor.encode("utf-8")) > MAX_BYTES_SENHA:
        raise ValueError(
            "Senha longa demais: o limite é de 72 bytes (acentos e emojis contam mais de 1)"
        )
    return valor


Email = Annotated[EmailStr, AfterValidator(_minusculo)]
SenhaNova = Annotated[
    str,
    Field(min_length=8, max_length=72),
    AfterValidator(_cabe_no_bcrypt),
]


class UserCreate(BaseModel):
    nome: str
    email: Email
    senha: SenhaNova
    sexo: str
    data_nascimento: date | None = None
    telefone: str | None = None


class AlterarSenha(BaseModel):
    senha_atual: str = Field(min_length=1, max_length=72)
    nova_senha: SenhaNova


class LoginData(BaseModel):
    email: Email
    senha: str = Field(max_length=128)


class PedirCodigo(BaseModel):
    email: Email


class VerificarCodigo(BaseModel):
    email: Email
    codigo: str = Field(pattern=r"^\d{6}$")


class NovaSenha(BaseModel):
    reset_token: str
    nova_senha: SenhaNova


class GoogleLogin(BaseModel):
    credential: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    novo_usuario: bool = False




class EstabelecimentoBase(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    tipo: str = Field(min_length=1, max_length=50)  # UPA, Hospital
    endereco: str = Field(min_length=1, max_length=300)
    bairro: str | None = None
    cep: str | None = None
    telefone: str | None = None
    horario_funcionamento: str | None = None
    latitude: float
    longitude: float
    codigo_cnes: str | None = None


class EstabelecimentoCreate(EstabelecimentoBase):
    pass


class EstabelecimentoUpdate(BaseModel):
    nome: str | None = None
    tipo: str | None = None
    endereco: str | None = None
    bairro: str | None = None
    cep: str | None = None
    telefone: str | None = None
    horario_funcionamento: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    ativo: bool | None = None


class EstabelecimentoResponse(EstabelecimentoBase):
    id: int
    ativo: bool
    distancia_km: float | None = None

    model_config = {"from_attributes": True}


class QuestionarioRespostas(BaseModel):
    respostas: dict[str, str]
    jornada_escolhida: str | None = None


class QuestionarioResultado(BaseModel):
    jornada_recomendada: str | None = None
    pontuacao: dict[str, int]
    empate: bool = False
    jornadas_empatadas: list[str] = []
    persistido: bool = False
    mensagem: str

class JornadaCreate(BaseModel):
    codigo: str = Field(min_length=1, max_length=80)
    nome: str = Field(min_length=1, max_length=120)

class JornadaResponse(BaseModel):
    id: int
    codigo: str
    nome: str
    iniciada_em: datetime
    concluida_em: datetime | None = None

    model_config = {"from_attributes": True}

class AtividadeCreate(BaseModel):
    jornada_id: int = Field(gt=0)
    referencia: str = Field(min_length=1, max_length=120)
    xp: int = Field(ge=0, le=10000)
    minutos: int = Field(ge=0, le=1440)

class AtividadeResponse(BaseModel):
    id: int
    jornada_id: int
    referencia: str
    xp: int
    minutos: int
    concluida_em: datetime

    model_config = {"from_attributes": True}

class DashboardResponse(BaseModel):
    diasAprendidos: int
    progressoSemanal: list[bool]
    xpHistorico: list[int]
    jornadas: int
    minutos: int