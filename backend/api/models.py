from sqlalchemy import (
    BigInteger, Boolean, Column, Date, DateTime, ForeignKey,
    Integer, SmallInteger, String, Text, func,
)

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(180), nullable=False, unique=True)
    senha_hash = Column(String(72))
    sexo = Column(String(50), nullable=False)
    data_nascimento = Column(Date)
    telefone = Column(String(30), unique=True)
    provider = Column(String(20), nullable=False, default="LOCAL")
    provider_id = Column(String(255))
    avatar_url = Column(Text)
    token_version = Column(Integer, nullable=False, default=0, server_default="0")
    email_verificado = Column(Boolean, nullable=False, default=False, server_default="false")
    criado_em = Column(DateTime(timezone=True), server_default=func.now())


class CodigoVerificacao(Base):
    __tablename__ = "codigos_verificacao"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    codigo_hash = Column(String(64), nullable=False)
    finalidade = Column(String(30), nullable=False, default="RECUPERAR_SENHA")
    tentativas = Column(SmallInteger, nullable=False, default=0)
    usado = Column(Boolean, nullable=False, default=False)
    expira_em = Column(DateTime(timezone=True), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())


class LimiteRequisicao(Base):
    """Registro de tentativas, usado para limitar login, cadastro, códigos etc."""

    __tablename__ = "limites_requisicao"

    id = Column(BigInteger, primary_key=True)
    acao = Column(String(30), nullable=False)
    chave = Column(String(200), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Estabelecimento(Base):
    __tablename__ = "estabelecimentos"

    id = Column(BigInteger, primary_key=True)
    nome = Column(String(200), nullable=False)
    tipo = Column(String(50), nullable=False)  # "UPA", "Hospital", "Policlinica"
    endereco = Column(String(300), nullable=False)
    bairro = Column(String(100))
    cep = Column(String(10))
    telefone = Column(String(30))
    horario_funcionamento = Column(String(200))
    latitude = Column(String(50), nullable=False)
    longitude = Column(String(50), nullable=False)
    codigo_cnes = Column(String(20), unique=True)
    ativo = Column(Boolean, nullable=False, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())


class ResultadoQuestionario(Base):
    __tablename__ = "resultados_questionario"

    id = Column(BigInteger, primary_key=True)
    usuario_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    respostas = Column(Text, nullable=False)       # JSON em string das respostas
    pontuacao = Column(Text, nullable=False)        # JSON em string dos pontos por jornada
    jornada_recomendada = Column(String(50), nullable=False)  # "cardiaca", "sono", "respiratoria"
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
