import json
import logging
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import geo, limites, models, schemas, security
from .config import CORS_ORIGINS, EM_PRODUCAO, GOOGLE_CLIENT_ID
from .database import get_db
from .email import enviar_codigo_verificacao

logger = logging.getLogger(__name__)


app = FastAPI(
    docs_url=None if EM_PRODUCAO else "/docs",
    redoc_url=None if EM_PRODUCAO else "/redoc",
    openapi_url=None if EM_PRODUCAO else "/openapi.json",
)
bearer = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

CODIGO_VALIDADE_MIN = 10
MAX_TENTATIVAS = 5
RESPOSTA_PEDIR = {"mensagem": "Se o e-mail estiver cadastrado, enviaremos um código."}

FINALIDADE_RECUPERAR = "RECUPERAR_SENHA"
FINALIDADE_VERIFICAR_EMAIL = "VERIFICAR_EMAIL"


LOGIN_POR_EMAIL = (5, 15)
LOGIN_POR_IP = (20, 15)
PEDIR_POR_EMAIL = (5, 60)
PEDIR_POR_IP = (10, 60)
REGISTRO_POR_IP = (10, 60)
CODIGO_POR_EMAIL = (10, 60)
CODIGO_POR_IP = (30, 60)
SENHA_ATUAL_POR_USUARIO = (5, 15)


def _emitir_codigo(db: Session, user: models.User, finalidade: str, background: BackgroundTasks):
    """Invalida os códigos anteriores da mesma finalidade, cria um novo e envia por e-mail."""
    CV = models.CodigoVerificacao
    db.query(CV).filter(
        CV.user_id == user.id,
        CV.finalidade == finalidade,
        CV.usado == False,
    ).update({"usado": True})

    codigo = security.gerar_codigo()
    db.add(CV(
        user_id=user.id,
        codigo_hash=security.hash_codigo(codigo),
        finalidade=finalidade,
        expira_em=datetime.now(timezone.utc) + timedelta(minutes=CODIGO_VALIDADE_MIN),
    ))
    db.commit()

    background.add_task(enviar_codigo_verificacao, user.email, codigo)


@app.post("/auth/google", response_model=schemas.Token)
def login_google(dados: schemas.GoogleLogin, db: Session = Depends(get_db)):
    try:
        info = id_token.verify_oauth2_token(
            dados.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except ValueError:
        logger.warning("Falha ao validar a credencial do Google")
        raise HTTPException(status_code=401, detail="Credencial do Google inválida")

    if not info.get("email_verified"):
        raise HTTPException(status_code=401, detail="E-mail do Google não verificado")

    email = info["email"].lower()
    google_id = info["sub"]

    user = db.query(models.User).filter(func.lower(models.User.email) == email).first()

    novo_usuario = user is None
    if novo_usuario:
        user = models.User(
            nome=info.get("name") or email.split("@")[0],
            email=email,
            sexo="Outro / Prefiro não informar",
            provider="GOOGLE",
            provider_id=google_id,
            avatar_url=info.get("picture"),
            email_verificado=True,
        )
        db.add(user)
    else:
        if not user.provider_id:
            user.provider_id = google_id
            if user.senha_hash:
                user.senha_hash = None
                user.token_version += 1
        if not user.avatar_url:
            user.avatar_url = info.get("picture")
        user.email_verificado = True

    db.commit()
    db.refresh(user)

    resultado = db.query(models.ResultadoQuestionario).filter(
        models.ResultadoQuestionario.usuario_id == user.id
    ).first()
    novo_usuario = novo_usuario or resultado is None

    return {
        "access_token": security.criar_token(user.id, user.email, user.token_version),
        "novo_usuario": novo_usuario,
    }


@app.post("/register", status_code=201)
def register(
    dados: schemas.UserCreate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    chave_ip = limites.k_ip(limites.ip_do_cliente(request))
    limites.checar(db, "REGISTER", [(chave_ip, *REGISTRO_POR_IP)])
    limites.registrar(db, "REGISTER", chave_ip)

    duplicado = HTTPException(status_code=400, detail="E-mail ou telefone já cadastrados")

    existente = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == dados.email)
        .first()
    )
    if existente and existente.email_verificado:
        raise duplicado

    if dados.telefone:
        consulta_telefone = db.query(models.User).filter(models.User.telefone == dados.telefone)
        if existente:
            consulta_telefone = consulta_telefone.filter(models.User.id != existente.id)
        if consulta_telefone.first():
            raise duplicado

    if existente:
        user = existente
        user.nome = dados.nome
        user.senha_hash = security.gerar_hash(dados.senha)
        user.sexo = dados.sexo
        user.data_nascimento = dados.data_nascimento
        user.telefone = dados.telefone
        user.token_version += 1
    else:
        user = models.User(
            nome=dados.nome,
            email=dados.email,
            senha_hash=security.gerar_hash(dados.senha),
            sexo=dados.sexo,
            data_nascimento=dados.data_nascimento,
            telefone=dados.telefone,
            provider="LOCAL",
            email_verificado=False,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    _emitir_codigo(db, user, FINALIDADE_VERIFICAR_EMAIL, background)
    return {"id": user.id, "nome": user.nome, "email": user.email}


@app.post("/register/verificar")
def verificar_email(
    dados: schemas.VerificarCodigo,
    request: Request,
    db: Session = Depends(get_db),
):
    invalido = HTTPException(status_code=400, detail="Código inválido ou expirado")

    email = dados.email.lower()
    chave_email = limites.k_email(email)
    chave_ip = limites.k_ip(limites.ip_do_cliente(request))

    limites.checar(
        db, "EMAIL_CODIGO", [(chave_email, *CODIGO_POR_EMAIL), (chave_ip, *CODIGO_POR_IP)]
    )

    def recusar():
        limites.registrar(db, "EMAIL_CODIGO", chave_email, chave_ip)
        return invalido

    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == email)
        .first()
    )
    if not user or user.email_verificado:
        raise recusar()

    CV = models.CodigoVerificacao
    registro = (
        db.query(CV)
        .filter(
            CV.user_id == user.id,
            CV.finalidade == FINALIDADE_VERIFICAR_EMAIL,
            CV.usado == False,
        )
        .order_by(CV.criado_em.desc())
        .first()
    )
    if not registro or registro.expira_em < datetime.now(timezone.utc):
        raise recusar()

    if registro.tentativas >= MAX_TENTATIVAS:
        raise HTTPException(status_code=429, detail="Muitas tentativas. Peça um novo código.")

    if not security.codigo_confere(dados.codigo, registro.codigo_hash):
        registro.tentativas += 1
        db.commit()
        raise recusar()

    registro.usado = True
    user.email_verificado = True
    db.commit()
    limites.limpar(db, "EMAIL_CODIGO", chave_email)
    return {"mensagem": "E-mail verificado com sucesso"}


@app.post("/register/reenviar")
def reenviar_codigo_cadastro(
    dados: schemas.PedirCodigo,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = dados.email.lower()
    chave_email = limites.k_email(email)
    chave_ip = limites.k_ip(limites.ip_do_cliente(request))

    limites.checar(
        db, "EMAIL_PEDIR", [(chave_email, *PEDIR_POR_EMAIL), (chave_ip, *PEDIR_POR_IP)]
    )
    limites.registrar(db, "EMAIL_PEDIR", chave_email, chave_ip)

    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == email)
        .first()
    )
    if not user or user.email_verificado:
        return RESPOSTA_PEDIR

    CV = models.CodigoVerificacao
    ultimo = (
        db.query(CV)
        .filter(CV.user_id == user.id, CV.finalidade == FINALIDADE_VERIFICAR_EMAIL)
        .order_by(CV.criado_em.desc())
        .first()
    )
    if ultimo and datetime.now(timezone.utc) - ultimo.criado_em < timedelta(seconds=60):
        return RESPOSTA_PEDIR

    _emitir_codigo(db, user, FINALIDADE_VERIFICAR_EMAIL, background)
    return RESPOSTA_PEDIR


@app.post("/auth/recuperar/pedir")
def pedir_codigo(
    dados: schemas.PedirCodigo,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = dados.email.lower()
    chave_email = limites.k_email(email)
    chave_ip = limites.k_ip(limites.ip_do_cliente(request))

    limites.checar(db, "PEDIR", [(chave_email, *PEDIR_POR_EMAIL), (chave_ip, *PEDIR_POR_IP)])
    limites.registrar(db, "PEDIR", chave_email, chave_ip)

    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == email)
        .first()
    )

    if not user:
        return RESPOSTA_PEDIR

    CV = models.CodigoVerificacao
    ultimo = (
        db.query(CV)
        .filter(CV.user_id == user.id, CV.finalidade == FINALIDADE_RECUPERAR)
        .order_by(CV.criado_em.desc())
        .first()
    )

    if ultimo and datetime.now(timezone.utc) - ultimo.criado_em < timedelta(seconds=60):
        return RESPOSTA_PEDIR

    _emitir_codigo(db, user, FINALIDADE_RECUPERAR, background)
    return RESPOSTA_PEDIR


@app.post("/auth/recuperar/verificar")
def verificar_codigo(
    dados: schemas.VerificarCodigo,
    request: Request,
    db: Session = Depends(get_db),
):
    invalido = HTTPException(status_code=400, detail="Código inválido ou expirado")

    email = dados.email.lower()
    chave_email = limites.k_email(email)
    chave_ip = limites.k_ip(limites.ip_do_cliente(request))

    limites.checar(db, "CODIGO", [(chave_email, *CODIGO_POR_EMAIL), (chave_ip, *CODIGO_POR_IP)])

    def recusar():
        limites.registrar(db, "CODIGO", chave_email, chave_ip)
        return invalido

    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == email)
        .first()
    )
    if not user:
        raise recusar()

    CV = models.CodigoVerificacao
    registro = (
        db.query(CV)
        .filter(
            CV.user_id == user.id,
            CV.finalidade == FINALIDADE_RECUPERAR,
            CV.usado == False,
        )
        .order_by(CV.criado_em.desc())
        .first()
    )
    if not registro or registro.expira_em < datetime.now(timezone.utc):
        raise recusar()

    if registro.tentativas >= MAX_TENTATIVAS:
        raise HTTPException(status_code=429, detail="Muitas tentativas. Peça um novo código.")

    if not security.codigo_confere(dados.codigo, registro.codigo_hash):
        registro.tentativas += 1
        db.commit()
        raise recusar()

    registro.usado = True
    db.commit()
    limites.limpar(db, "CODIGO", chave_email)
    return {"reset_token": security.criar_reset_token(user.id, user.token_version)}


@app.post("/auth/recuperar/nova-senha")
def nova_senha(dados: schemas.NovaSenha, db: Session = Depends(get_db)):
    sessao_invalida = HTTPException(
        status_code=400, detail="Sessão de recuperação inválida ou expirada"
    )

    try:
        user_id, versao = security.ler_reset_token(dados.reset_token)
    except (jwt.PyJWTError, ValueError, TypeError, KeyError):
        raise sessao_invalida

    user = db.get(models.User, user_id)

    if not user or user.token_version != versao:
        raise sessao_invalida

    user.senha_hash = security.gerar_hash(dados.nova_senha)
    user.token_version += 1
    user.email_verificado = True

    CV = models.CodigoVerificacao
    db.query(CV).filter(CV.user_id == user.id, CV.usado == False).update({"usado": True})

    db.commit()
    return {"mensagem": "Senha alterada com sucesso"}


@app.post("/login", response_model=schemas.Token)
def login(dados: schemas.LoginData, request: Request, db: Session = Depends(get_db)):
    email = dados.email.lower()
    chave_email = limites.k_email(email)
    chave_ip = limites.k_ip(limites.ip_do_cliente(request))

    limites.checar(db, "LOGIN", [(chave_email, *LOGIN_POR_EMAIL), (chave_ip, *LOGIN_POR_IP)])

    user = db.query(models.User).filter(func.lower(models.User.email) == email).first()

    if user and user.senha_hash:
        senha_ok = security.verificar_senha(dados.senha, user.senha_hash)
    else:
        security.gastar_tempo_de_hash(dados.senha)
        senha_ok = False

    if not senha_ok:
        limites.registrar(db, "LOGIN", chave_email, chave_ip)
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    if not user.email_verificado:
        raise HTTPException(
            status_code=403,
            detail="Confirme seu e-mail antes de entrar. Refaça o cadastro para receber um novo código.",
        )

    limites.limpar(db, "LOGIN", chave_email)
    return {"access_token": security.criar_token(user.id, user.email, user.token_version)}


def usuario_atual(
    cred: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    try:
        user_id, versao = security.ler_token(cred.credentials)
    except (jwt.PyJWTError, ValueError, TypeError, KeyError):
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    if user.token_version != versao:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    return user


@app.get("/me")
def me(user: models.User = Depends(usuario_atual)):
    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "avatar_url": user.avatar_url,
    }


@app.post("/me/senha")
def alterar_senha(
    dados: schemas.AlterarSenha,
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    if not user.senha_hash:
        raise HTTPException(
            status_code=400,
            detail="Sua conta usa o login do Google e ainda não tem senha. Use 'Esqueci minha senha' para criar uma.",
        )

    chave = limites.k_usuario(user.id)
    limites.checar(db, "SENHA_ATUAL", [(chave, *SENHA_ATUAL_POR_USUARIO)])

    if not security.verificar_senha(dados.senha_atual, user.senha_hash):
        limites.registrar(db, "SENHA_ATUAL", chave)
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    if dados.senha_atual == dados.nova_senha:
        raise HTTPException(status_code=400, detail="A nova senha precisa ser diferente da atual")

    user.senha_hash = security.gerar_hash(dados.nova_senha)
    user.token_version += 1
    db.commit()
    limites.limpar(db, "SENHA_ATUAL", chave)

    return {
        "mensagem": "Senha alterada com sucesso",
        "access_token": security.criar_token(user.id, user.email, user.token_version),
    }




from . import questionario, geo
from .database import engine as _engine

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
