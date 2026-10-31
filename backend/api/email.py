import logging
from html import escape

import httpx

from .config import BREVO_API_KEY, EMAIL_REMETENTE, NOME_REMETENTE
from .email_theme import CSS_EMAIL_TRANSACIONAL

logger = logging.getLogger(__name__)

BREVO_URL = "https://api.brevo.com/v3/smtp/email"
LOGO_URL = "https://raw.githubusercontent.com/jaq1997/informa-saude-frontend/main/informa-saude/src/assets/images/logo.svg"

def _montar_html(conteudo: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>{CSS_EMAIL_TRANSACIONAL}</style>
</head>
<body>
<div class="container">
<div class="header"><img src="{LOGO_URL}" alt="informa-Saúde"></div>
<div class="content">
{conteudo}
</div>
<div class="footer"><p>© informa-Saúde. Todos os direitos reservados.</p></div>
</div>
</body>
</html>"""


def enviar_email(
    destinatario: str,
    assunto: str,
    html: str,
    texto: str | None = None,
    nome_destinatario: str | None = None,
) -> bool:
    para = {"email": destinatario}
    if nome_destinatario:
        para["name"] = nome_destinatario

    payload = {
        "sender": {"name": NOME_REMETENTE, "email": EMAIL_REMETENTE},
        "to": [para],
        "subject": assunto,
        "htmlContent": html,
    }
    if texto:
        payload["textContent"] = texto

    try:
        resposta = httpx.post(
            BREVO_URL,
            json=payload,
            headers={"api-key": BREVO_API_KEY, "accept": "application/json"},
            timeout=10,
        )
        logger.info(
            "E-mail enviado pelo Brevo para %s: HTTP %s",
            destinatario,
            resposta.status_code,
        )
        resposta.raise_for_status()
        return True
    except httpx.HTTPStatusError as e:
        logger.error("Erro Brevo (%s): %s", e.response.status_code, e.response.text)
        return False
    except httpx.HTTPError as e:
        logger.error("Erro ao enviar e-mail: %s", e)
        return False


def enviar_codigo_verificacao(destinatario: str, codigo: str) -> bool:
    texto_plano = (
        f"Olá!\n\nSeu código de verificação na informa-Saúde é: {codigo}\n\n"
        "Ele expira em 10 minutos. Se você não pediu este código, ignore este e-mail."
    )
    conteudo = f"""
<p>Olá,</p>
<p>Recebemos uma solicitação de acesso ou alteração em sua conta na <strong>informa-Saúde</strong>. Utilize o código abaixo para prosseguir:</p>
<div class="code-box">{escape(codigo)}</div>
<p>Este código <strong>expira em 10 minutos</strong>.</p>
<p>Se você não solicitou esta alteração, pode ignorar este e-mail com total segurança.</p>
"""
    return enviar_email(
        destinatario,
        "Seu código de verificação - informa-Saúde",
        _montar_html(conteudo),
        texto_plano,
    )