EMAIL_TOKENS = {
    "verde": "#00645A",
    "verde_escuro": "#004840",
    "verde_claro": "#E6F2F1",
    "texto": "#333333",
    "fundo": "#F4F7F6",
    "branco": "#FFFFFF",
}


CSS_EMAIL_TRANSACIONAL = f"""
body {{
    font-family: Arial, sans-serif;
    background-color: {EMAIL_TOKENS["fundo"]};
    margin: 0;
    padding: 0;
}}
.container {{
    max-width: 600px;
    margin: 40px auto;
    background: {EMAIL_TOKENS["branco"]};
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}}
.header {{
    background-color: {EMAIL_TOKENS["verde"]};
    text-align: center;
    padding: 14px 20px;
}}
.header img {{
    max-height: 65px;
    width: auto;
    display: block;
    margin: 0 auto;
}}
.content {{
    padding: 32px;
    color: {EMAIL_TOKENS["texto"]};
    font-size: 16px;
    line-height: 1.6;
}}
.code-box {{
    background-color: {EMAIL_TOKENS["verde_claro"]};
    border: 2px dashed {EMAIL_TOKENS["verde"]};
    border-radius: 6px;
    font-size: 34px;
    font-weight: bold;
    letter-spacing: 8px;
    color: {EMAIL_TOKENS["verde"]};
    text-align: center;
    padding: 16px;
    margin: 28px 0;
}}
.footer {{
    text-align: center;
    padding: 16px;
    font-size: 13px;
    color: {EMAIL_TOKENS["branco"]};
    background-color: {EMAIL_TOKENS["verde"]};
}}
"""
