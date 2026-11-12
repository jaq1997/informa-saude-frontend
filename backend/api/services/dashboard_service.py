from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .. import models

FUSO_PADRAO = ZoneInfo("America/Sao_Paulo")

def _agora():
    return datetime.now(timezone.utc)

def criar_jornada(
    db: Session,
    usuario_id: int,
    codigo: str,
    nome: str,
):
    codigo = codigo.strip()
    nome = nome.strip()

    if not codigo or not nome:
        raise HTTPException(
            status_code=422,
            detail="Código e nome da jornada são obrigatórios",
        )

    existente = (
        db.query(models.JornadaUsuario)
        .filter(
            models.JornadaUsuario.usuario_id == usuario_id,
            models.JornadaUsuario.codigo == codigo,
        )
        .first()
    )

    if existente:
        raise HTTPException(
            status_code=409,
            detail="Esta jornada já foi iniciada",
        )

    jornada = models.JornadaUsuario(
        usuario_id=usuario_id,
        codigo=codigo,
        nome=nome,
    )

    db.add(jornada)
    db.commit()
    db.refresh(jornada)

    return jornada

def listar_jornadas(db: Session, usuario_id: int):
    return (
        db.query(models.JornadaUsuario)
        .filter(models.JornadaUsuario.usuario_id == usuario_id)
        .order_by(models.JornadaUsuario.iniciada_em.desc())
        .all()
    )

def registrar_atividade(
    db: Session,
    usuario_id: int,
    jornada_id: int,
    referencia: str,
    xp: int,
    minutos: int,
):
    referencia = referencia.strip()

    if not referencia:
        raise HTTPException(
            status_code=422,
            detail="Referência da atividade é obrigatória",
        )

    jornada = (
        db.query(models.JornadaUsuario)
        .filter(
            models.JornadaUsuario.id == jornada_id,
            models.JornadaUsuario.usuario_id == usuario_id,
        )
        .first()
    )

    if not jornada:
        raise HTTPException(
            status_code=404,
            detail="Jornada não encontrada",
        )

    if jornada.concluida_em is not None:
        raise HTTPException(
            status_code=409,
            detail="Não é possível adicionar atividades a uma jornada concluída",
        )

    existente = (
        db.query(models.AtividadeAprendizado)
        .filter(
            models.AtividadeAprendizado.usuario_id == usuario_id,
            models.AtividadeAprendizado.referencia == referencia,
        )
        .first()
    )

    if existente:
        raise HTTPException(
            status_code=409,
            detail="Esta atividade já foi registrada",
        )

    atividade = models.AtividadeAprendizado(
        usuario_id=usuario_id,
        jornada_id=jornada.id,
        referencia=referencia,
        xp=xp,
        minutos=minutos,
    )

    db.add(atividade)
    db.commit()
    db.refresh(atividade)

    return atividade

def concluir_jornada(
    db: Session,
    usuario_id: int,
    jornada_id: int,
):
    jornada = (
        db.query(models.JornadaUsuario)
        .filter(
            models.JornadaUsuario.id == jornada_id,
            models.JornadaUsuario.usuario_id == usuario_id,
        )
        .first()
    )

    if not jornada:
        raise HTTPException(
            status_code=404,
            detail="Jornada não encontrada",
        )

    if jornada.concluida_em is None:
        jornada.concluida_em = _agora()
        db.commit()
        db.refresh(jornada)

    return jornada

def _inicio_mes(data):
    return data.replace(day=1)

def _mes_anterior(data):
    return (data.replace(day=1) - timedelta(days=1)).replace(day=1)

def obter_dashboard(
    db: Session,
    usuario_id: int,
):
    atividades = (
        db.query(models.AtividadeAprendizado)
        .filter(models.AtividadeAprendizado.usuario_id == usuario_id)
        .all()
    )

    total_jornadas = (
        db.query(models.JornadaUsuario)
        .filter(models.JornadaUsuario.usuario_id == usuario_id)
        .count()
    )

    hoje = _agora().astimezone(FUSO_PADRAO).date()

    inicio_semana = hoje - timedelta(days=hoje.weekday())

    datas_aprendizado = set()
    xp_por_mes = {}
    total_minutos = 0

    for atividade in atividades:
        data_local = atividade.concluida_em

        if data_local.tzinfo is None:
            data_local = data_local.replace(tzinfo=timezone.utc)

        data_local = data_local.astimezone(FUSO_PADRAO)
        dia = data_local.date()

        datas_aprendizado.add(dia)
        total_minutos += atividade.minutos

        chave_mes = (dia.year, dia.month)

        xp_por_mes[chave_mes] = (
            xp_por_mes.get(chave_mes, 0) + atividade.xp
        )

    progresso_semanal = [
        inicio_semana + timedelta(days=i) in datas_aprendizado
        for i in range(7)
    ]

    mes_atual = _inicio_mes(hoje)
    mes_anterior = _mes_anterior(mes_atual)
    dois_meses_atras = _mes_anterior(mes_anterior)

    meses = [
        dois_meses_atras,
        mes_anterior,
        mes_atual,
    ]

    xp_historico = [
        xp_por_mes.get((mes.year, mes.month), 0)
        for mes in meses
    ]

    return {
        "diasAprendidos": len(datas_aprendizado),
        "progressoSemanal": progresso_semanal,
        "xpHistorico": xp_historico,
        "jornadas": total_jornadas,
        "minutos": total_minutos,
    }