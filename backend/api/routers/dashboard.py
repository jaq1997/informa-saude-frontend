from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencias import usuario_atual
from ..services import dashboard_service


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("", response_model=schemas.DashboardResponse)
def consultar_dashboard(
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    return dashboard_service.obter_dashboard(
        db=db,
        usuario_id=usuario.id,
    )


@router.post(
    "/jornadas",
    response_model=schemas.JornadaResponse,
    status_code=status.HTTP_201_CREATED,
)
def iniciar_jornada(
    dados: schemas.JornadaCreate,
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    return dashboard_service.criar_jornada(
        db=db,
        usuario_id=usuario.id,
        codigo=dados.codigo,
        nome=dados.nome,
    )


@router.get(
    "/jornadas",
    response_model=list[schemas.JornadaResponse],
)
def consultar_jornadas(
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    return dashboard_service.listar_jornadas(
        db=db,
        usuario_id=usuario.id,
    )


@router.patch(
    "/jornadas/{jornada_id}/concluir",
    response_model=schemas.JornadaResponse,
)
def finalizar_jornada(
    jornada_id: int,
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    return dashboard_service.concluir_jornada(
        db=db,
        usuario_id=usuario.id,
        jornada_id=jornada_id,
    )


@router.post(
    "/atividades",
    response_model=schemas.AtividadeResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_atividade(
    dados: schemas.AtividadeCreate,
    usuario: models.User = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    return dashboard_service.registrar_atividade(
        db=db,
        usuario_id=usuario.id,
        jornada_id=dados.jornada_id,
        referencia=dados.referencia,
        xp=dados.xp,
        minutos=dados.minutos,
    )