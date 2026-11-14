# InformaSaúde 

Plataforma web de educação e acesso à saúde para pessoas com 50+. Projeto Final do Programa de Formação Full Stack +praTi.

[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Este documento descreve a **arquitetura, a configuração do ambiente e a API**.

## Sumário

- [Visão Técnica](#visão-técnica)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Stack](#stack)
- [Executando Localmente](#executando-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API](#api)
- [Integrações Externas](#integrações-externas)
- [Solução de Problemas](#solução-de-problemas)

---

## Visão Técnica

Aplicação em duas camadas:

- **Frontend** (`informa-saude/`): SPA em React 19 + Vite, consome a API REST.
- **Backend** (`backend/`): API FastAPI com SQLAlchemy e PostgreSQL.

Módulos principais: autenticação (e-mail/senha + Google OAuth 2.0), questionário de triagem com pontuação ponderada, dashboard de progresso e localização de unidades de saúde com rotas (Leaflet + OSRM + ViaCEP).

---

## Arquitetura

```mermaid
flowchart TD
    subgraph Frontend ["Frontend Web (React 19 + Vite)"]
        UI["Interface"]
        Map["Leaflet Maps"]
    end

    subgraph Backend ["API Backend (FastAPI)"]
        Rotas["Endpoints REST (/docs)"]
        Auth["JWT & Google OAuth"]
        GeoEngine["Mecanismo OSRM & Geocoding"]
    end

    subgraph Persistencia ["Banco de Dados"]
        DB[("PostgreSQL")]
    end

    subgraph Externos ["Serviços Externos"]
        Brevo["Brevo API (E-mails)"]
        OSRM["OSRM (Rotas)"]
        ViaCEP["ViaCEP (Endereços)"]
    end

    UI --> Rotas
    Map --> GeoEngine
    Rotas --> DB
    Auth --> Brevo
    GeoEngine --> OSRM
    GeoEngine --> ViaCEP
```

---

## Estrutura de Pastas

> Ajuste conforme o repositório real.

```text
.
├── backend/
│   ├── api/
│   │   └── main.py                  # Entrada da aplicação FastAPI
│   ├── seed_estabelecimentos.py     # Popula postos e hospitais
│   ├── requirements.txt
│   └── .env
├── informa-saude/                   # Frontend
│   ├── src/
│   ├── package.json
│   └── .env
└── README.md
```

---

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, Vite, React Router DOM v7, Bootstrap 5, Lucide React, Leaflet / React-Leaflet |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Pydantic v2 |
| Banco | PostgreSQL |
| Integrações | OSRM, ViaCEP, Brevo API, Google OAuth 2.0 |

---

## Executando Localmente

### Pré-requisitos

- Node.js v18+ e npm
- Python v3.11+
- PostgreSQL ativo, com o banco criado:

```sql
CREATE DATABASE informasaude;
```

### Backend

```bash
cd backend

python -m venv .venv
source .venv/Scripts/activate      # Git Bash (Windows)
# source .venv/bin/activate        # Linux / macOS
# .\.venv\Scripts\Activate.ps1     # PowerShell

pip install -r requirements.txt

# Crie o .env (veja "Variáveis de Ambiente")

python seed_estabelecimentos.py    # popula postos e hospitais
uvicorn api.main:app --reload --port 8000
```

API em <http://127.0.0.1:8000>

### Frontend

Em outro terminal:

```bash
cd informa-saude
npm install
npm run dev
```

App em <http://localhost:5173>

### Verificação rápida

- [ ] `http://127.0.0.1:8000/docs` abre o Swagger
- [ ] `http://localhost:5173` carrega o app
- [ ] O mapa lista unidades (confirma que o seed rodou)

---

## Variáveis de Ambiente

> Nomes de exemplo: use os que o código realmente lê. Nunca versione `.env`.

**`backend/.env`**

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL, ex.: `postgresql://user:senha@localhost:5432/informasaude` |
| `SECRET_KEY` | Chave de assinatura do JWT |
| `GOOGLE_CLIENT_ID` | Client ID do OAuth 2.0 |
| `BREVO_API_KEY` | Chave da API Brevo (e-mail de recuperação) |
| `FRONTEND_URL` | Origem liberada no CORS, ex.: `http://localhost:5173` |

**`informa-saude/.env`**

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API, ex.: `http://127.0.0.1:8000` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID do OAuth 2.0 |

---

## API

Documentação interativa (com a API rodando):

- **Swagger UI** (testes via "Try it out"): <http://127.0.0.1:8000/docs>
- **ReDoc** (referência de schemas): <http://127.0.0.1:8000/redoc>

### Rotas

| Prefixo | Responsabilidade |
|---|---|
| `/api/auth/*` | Cadastro, login, recuperação de senha, OAuth Google |
| `/api/questionario/*` | Perguntas da triagem e cálculo das recomendações |
| `/api/dashboard/*` | Episódios concluídos, dias ativos, métricas |
| `/api/geo/*` | Geocodificação por CEP (ViaCEP) |
| `/api/estabelecimentos/*` | Unidades de saúde e cálculo de rotas (OSRM) |

### Autenticação

Rotas protegidas usam JWT no cabeçalho:

```http
Authorization: Bearer <token>
```

No Swagger, use o botão **Authorize**.

---

## Integrações Externas

| Serviço | Uso | Observação |
|---|---|---|
| OSRM | Distância e tempo por vias públicas | Instância pública pode ter limite de requisições |
| ViaCEP | CEP → endereço/coordenadas (fallback sem GPS) | Sem chave |
| Brevo | Envio do código de 6 dígitos de recuperação | Requer `BREVO_API_KEY` e remetente validado |
| Google OAuth 2.0 | Login social | Requer origens autorizadas no Google Cloud |

---

## Solução de Problemas

| Problema | Causa provável | Solução |
|---|---|---|
| `connection refused` ao subir a API | PostgreSQL parado ou `DATABASE_URL` errada | Inicie o serviço e confira credenciais |
| `database "informasaude" does not exist` | Banco não criado | `CREATE DATABASE informasaude;` |
| Mapa sem unidades | Seed não executado | `python seed_estabelecimentos.py` |
| Erro de CORS | Origem não liberada | Ajuste `FRONTEND_URL` no backend |
| `Activate.ps1` bloqueado | Política de execução do PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Rota não calculada | OSRM público indisponível | Tente novamente ou use instância própria |
| Login Google falha | Client ID ou origens incorretos | Confira o Google Cloud Console |
| E-mail de recuperação não chega | Chave/remetente Brevo inválidos | Verifique `BREVO_API_KEY` e o remetente |
