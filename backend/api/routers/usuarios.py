from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import limites, models, schemas, security
from ..database import get_db
from ..dependencias import usuario_atual
from ..email import enviar_aviso_senha_alterada
from ..regras import SENHA_ATUAL_POR_USUARIO
from ..services import storage

router = APIRouter(tags=["Usuário"])


@router.get("/me")
def me(
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    resultado = (
        db.query(models.ResultadoQuestionario)
        .filter(models.ResultadoQuestionario.usuario_id == user.id)
        .first()
    )

    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "telefone": user.telefone,
        "data_nascimento": (
            user.data_nascimento.strftime("%d/%m/%Y")
            if user.data_nascimento
            else ""
        ),
        "sexo": user.sexo,
        "provider": user.provider,
        "jornada_recomendada": (
            resultado.jornada_recomendada if resultado else None
        ),
    }


@router.put("/me")
def atualizar_perfil(
    dados: schemas.UserUpdate,
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    email_alterado = False

    # 1. e-mail
    if dados.email is not None and dados.email.lower() != user.email.lower():
        if user.provider == "GOOGLE":
            raise HTTPException(
                status_code=400,
                detail="Contas vinculadas ao Google não podem alterar o e-mail cadastrado.",
            )

        email_existente = (
            db.query(models.User)
            .filter(
                func.lower(models.User.email) == dados.email.lower(),
                models.User.id != user.id,
            )
            .first()
        )
        if email_existente:
            raise HTTPException(
                status_code=400,
                detail="Este e-mail já está sendo utilizado por outra conta.",
            )
        user.email = dados.email.lower()
        email_alterado = True

    # 2. telefone
    if dados.telefone is not None:
        telefone_limpo = dados.telefone.strip() or None
        if telefone_limpo != user.telefone:
            if telefone_limpo:
                telefone_existente = (
                    db.query(models.User)
                    .filter(
                        models.User.telefone == telefone_limpo,
                        models.User.id != user.id,
                    )
                    .first()
                )
                if telefone_existente:
                    raise HTTPException(
                        status_code=400,
                        detail="Este telefone já está cadastrado em outra conta.",
                    )
            user.telefone = telefone_limpo

    # 3. Nome
    if dados.nome is not None:
        nome_limpo = dados.nome.strip()
        if not nome_limpo:
            raise HTTPException(
                status_code=400,
                detail="O nome não pode ser vazio.",
            )
        user.nome = nome_limpo

    # 4. Data de nascimento
    if dados.data_nascimento is not None:
        user.data_nascimento = dados.data_nascimento

    # 5. Sexo
    if dados.sexo is not None:
        user.sexo = dados.sexo

    db.commit()
    db.refresh(user)

    resultado = (
        db.query(models.ResultadoQuestionario)
        .filter(models.ResultadoQuestionario.usuario_id == user.id)
        .first()
    )

    resposta = {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "telefone": user.telefone,
        "data_nascimento": (
            user.data_nascimento.strftime("%d/%m/%Y")
            if user.data_nascimento
            else ""
        ),
        "sexo": user.sexo,
        "provider": user.provider,
        "jornada_recomendada": (
            resultado.jornada_recomendada if resultado else None
        ),
    }

    if email_alterado:
        resposta["access_token"] = security.criar_token(
            user.id, user.email, user.token_version
        )

    return resposta


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


@router.post("/me/foto")
async def atualizar_foto(
    foto: UploadFile = File(...),
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    url_foto = await storage.upload_avatar(foto, user.id)
    user.avatar_url = url_foto
    db.commit()
    db.refresh(user)

    return {
        "mensagem": "Foto atualizada com sucesso",
        "avatar_url": user.avatar_url,
    }


@router.delete("/me/foto")
def remover_foto(
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    user.avatar_url = None
    db.commit()
    db.refresh(user)

    return {
        "mensagem": "Foto removida com sucesso",
    }


@router.delete("/me")
def excluir_conta(
    user: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    db.delete(user)
    db.commit()

    return {
        "mensagem": "Conta excluída com sucesso.",
    }