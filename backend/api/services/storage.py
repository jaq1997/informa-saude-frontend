import logging
import uuid

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile

from ..config import (
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL,
    R2_SECRET_ACCESS_KEY,
)

logger = logging.getLogger(__name__)

EXTENSOES_PERMITIDAS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_TAMANHO_BYTES = 5 * 1024 * 1024  # 5 MB


def r2_configurado() -> bool:
    return bool(
        R2_ACCOUNT_ID
        and R2_ACCESS_KEY_ID
        and R2_SECRET_ACCESS_KEY
        and R2_PUBLIC_URL
        and "sua_chave_de_acesso_r2" not in R2_ACCESS_KEY_ID
    )


def obter_cliente_r2():
    if not r2_configurado():
        raise HTTPException(
            status_code=503,
            detail="Armazenamento Cloudflare R2 não está configurado no servidor (.env).",
        )

    endpoint = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    return boto3.client(
        service_name="s3",
        endpoint_url=endpoint,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


async def upload_avatar(arquivo: UploadFile, usuario_id: int) -> str:
    content_type = arquivo.content_type or ""
    if content_type not in EXTENSOES_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail="Formato de imagem não suportado. Envie arquivos JPG, PNG ou WebP.",
        )

    conteudo = await arquivo.read()
    if len(conteudo) > MAX_TAMANHO_BYTES:
        raise HTTPException(
            status_code=400,
            detail="A imagem deve ter no máximo 5 MB.",
        )

    extensao = EXTENSOES_PERMITIDAS[content_type]
    nome_objeto = f"avatars/{usuario_id}_{uuid.uuid4().hex[:8]}{extensao}"

    s3 = obter_cliente_r2()
    try:
        s3.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=nome_objeto,
            Body=conteudo,
            ContentType=content_type,
        )
    except (BotoCoreError, ClientError) as e:
        logger.error("Erro ao enviar imagem para o Cloudflare R2: %s", e)
        raise HTTPException(
            status_code=502,
            detail="Não foi possível enviar a imagem para o serviço de armazenamento.",
        )

    return f"{R2_PUBLIC_URL}/{nome_objeto}"
