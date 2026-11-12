import re
import time
from datetime import date
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Response, UploadFile
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import limites, models, schemas, security
from ..database import get_db
from ..dependencias import usuario_atual
from ..email import enviar_aviso_senha_alterada
from ..regras import SENHA_ATUAL_POR_USUARIO

router = APIRouter(tags=["Usuário"])

TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024


class AtualizarPerfil(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None


def dados_do_usuario(user: models.User) -> dict:
    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "telefone": user.telefone,
        "data_nascimento": user.data_nascimento,
        "avatar_url": user.avatar_url,
        "provider": user.provider,
    }


def detectar_tipo_imagem(conteudo: bytes) -> Optional[str]:
    if conteudo.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if conteudo.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if conteudo[:4] == b"RIFF" and conteudo[8:12] == b"WEBP":
        return "image/webp"
    return None


@router.get("/me")
def me(user: models.User = Depends(usuario_atual)):
    return dados_do_usuario(user)


@router.put("/me")
def atualizar_perfil(
    dados: AtualizarPerfil,
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    nome = " ".join(dados.nome.split())
    if len(nome) < 2 or len(nome) > 120:
        raise HTTPException(status_code=422, detail="Informe um nome válido")

    email = dados.email.strip().lower()

    telefone = None
    if dados.telefone and dados.telefone.strip():
        telefone = re.sub(r"\D", "", dados.telefone)
        if len(telefone) not in (10, 11):
            raise HTTPException(status_code=422, detail="Telefone inválido")

    nascimento = dados.data_nascimento
    if nascimento:
        hoje = date.today()
        if nascimento >= hoje or nascimento.year < hoje.year - 120:
            raise HTTPException(status_code=422, detail="Data de nascimento inválida")

    email_mudou = email != (user.email or "").lower()
    if email_mudou:
        if user.provider == "GOOGLE":
            raise HTTPException(
                status_code=400,
                detail="O e-mail de uma conta Google não pode ser alterado",
            )
        em_uso = (
            db.query(models.User)
            .filter(func.lower(models.User.email) == email, models.User.id != user.id)
            .first()
        )
        if em_uso:
            raise HTTPException(status_code=409, detail="Este e-mail já está em uso")

    if telefone and telefone != user.telefone:
        em_uso = (
            db.query(models.User)
            .filter(models.User.telefone == telefone, models.User.id != user.id)
            .first()
        )
        if em_uso:
            raise HTTPException(status_code=409, detail="Este telefone já está em uso")

    user.nome = nome
    user.email = email
    user.telefone = telefone
    user.data_nascimento = nascimento
    db.commit()
    db.refresh(user)

    resposta = dados_do_usuario(user)
    if email_mudou:
        resposta["access_token"] = security.criar_token(
            user.id, user.email, user.token_version
        )
    return resposta


@router.put("/me/foto")
def alterar_foto(
    arquivo: UploadFile = File(...),
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    conteudo = arquivo.file.read(TAMANHO_MAXIMO_FOTO + 1)
    if len(conteudo) > TAMANHO_MAXIMO_FOTO:
        raise HTTPException(status_code=413, detail="A imagem deve ter no máximo 2 MB")

    tipo = detectar_tipo_imagem(conteudo)
    if not tipo:
        raise HTTPException(status_code=415, detail="Envie uma imagem JPG, PNG ou WEBP")

    user.avatar_dados = conteudo
    user.avatar_tipo = tipo
    user.avatar_url = f"/usuarios/{user.id}/avatar?v={int(time.time())}"
    db.commit()
    db.refresh(user)
    return dados_do_usuario(user)


@router.delete("/me/foto")
def remover_foto(
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    user.avatar_dados = None
    user.avatar_tipo = None
    user.avatar_url = None
    db.commit()
    db.refresh(user)
    return dados_do_usuario(user)


@router.get("/usuarios/{user_id}/avatar")
def obter_avatar(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.avatar_dados:
        raise HTTPException(status_code=404, detail="Foto não encontrada")
    return Response(
        content=user.avatar_dados,
        media_type=user.avatar_tipo or "image/jpeg",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@router.post("/me/senha")
def alterar_senha(
    dados: schemas.AlterarSenha,
    background: BackgroundTasks,
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

    background.add_task(enviar_aviso_senha_alterada, user.email)

    return {
        "mensagem": "Senha alterada com sucesso",
        "access_token": security.criar_token(user.id, user.email, user.token_version),
    }