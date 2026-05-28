# RadIA — Triagem Inteligente de Exames Radiológicos

Sistema de triagem radiológica com IA para o SUS, desenvolvido para o Weekathon.
Prioriza automaticamente a fila de exames em **Crítico / Prioritário / Eletivo**,
permitindo que radiologistas leiam primeiro o que mais precisa de atenção.

---

## Problema

O SUS enfrenta escassez de radiologistas — concentrados em capitais — gerando filas de
exames não lidos por dias. Sem triagem, um AVC agudo espera na mesma fila que uma
lombalgia crônica.

## Solução

```
Upload de exame (DICOM / JPG / PNG)
         ↓
  FastAPI persiste no PostgreSQL
         ↓
  Celery + Redis: análise assíncrona
         ↓
  IA (DenseNet121 / heurística) classifica urgência
         ↓
  Fila reordenada automaticamente → CRÍTICO sobe ao topo
         ↓
  Radiologista lê em ordem de prioridade + emite laudo
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Banco | PostgreSQL (via Supabase ou local) |
| Filas | Celery + Redis |
| IA | PyTorch / DenseNet121 + heurística de imagem |
| DICOM | pydicom |
| Deploy | Railway (backend) + Vercel (frontend) |

---

## Início rápido (Docker)

```bash
# 1. Clone e configure variáveis de ambiente
cp .env.example .env          # ajuste se necessário

# 2. Suba tudo com Docker Compose
docker compose up --build

# 3. Acesse
#   Frontend:  http://localhost:3000
#   API docs:  http://localhost:8000/docs
#   Flower:    http://localhost:5555  (monitor de filas)
```

O banco é inicializado automaticamente com o schema e 5 pacientes de exemplo.

---

## Desenvolvimento local (sem Docker)

### Backend

```bash
cd backend

# Ambiente virtual
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Banco e Redis precisam estar rodando (docker compose up postgres redis)
export DATABASE_URL="postgresql://radia:radia123@localhost:5432/radia"
export REDIS_URL="redis://localhost:6379/0"
export AI_MODE="demo"          # "demo" não requer GPU; "ml" usa DenseNet121

# API
uvicorn app.main:app --reload

# Worker Celery (em outro terminal)
celery -A app.tasks.celery_app worker --loglevel=info -Q ai_analysis
```

### Frontend

```bash
cd frontend
npm install

# Crie .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev          # http://localhost:3000
```

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | `postgresql://radia:radia123@postgres:5432/radia` | URL do PostgreSQL |
| `REDIS_URL` | `redis://redis:6379/0` | URL do Redis |
| `AI_MODE` | `demo` | `demo` = heurística rápida; `ml` = DenseNet121 PyTorch |
| `SUPABASE_URL` | — | Opcional — storage em produção |
| `SUPABASE_KEY` | — | Opcional — storage em produção |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL da API para o frontend |

---

## API — Endpoints principais

```
POST   /api/v1/exams/          Upload de exame (multipart/form-data)
GET    /api/v1/exams/queue     Fila priorizada por urgência
GET    /api/v1/exams/{id}      Detalhe com resultado da IA
GET    /api/v1/exams/{id}/status  Polling de status (AGUARDANDO → ANALISADO)

POST   /api/v1/patients/       Cadastrar paciente
GET    /api/v1/patients/       Listar / buscar pacientes

POST   /api/v1/reports/        Emitir laudo (radiologista)
GET    /api/v1/reports/exam/{id}  Laudos de um exame

GET    /api/v1/stats/dashboard  Cards do dashboard

GET    /docs                   Swagger UI completo
```

---

## Modos de IA

### `AI_MODE=demo` (padrão)
Análise baseada em estatísticas da imagem (entropia, assimetria, gradiente).
- Não requer GPU
- Resultado em < 500 ms
- Determinístico: mesma imagem → mesmo resultado
- Ideal para demonstração e ambientes sem GPU

### `AI_MODE=ml`
Usa DenseNet121 (pretrained ImageNet via torchvision) como extrator de features,
combinado com análise estatística da imagem.
- Requer `torch` instalado (já no requirements.txt)
- ~2-5 s na CPU
- Download automático do modelo na primeira execução (~30 MB)

---

## Estrutura do projeto

```
projeto_weekathon/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── migrations/
│   │   └── 001_initial.sql        ← Schema + view fila priorizada
│   └── app/
│       ├── main.py                ← FastAPI app, CORS, rotas
│       ├── config.py              ← Settings (pydantic-settings)
│       ├── database.py            ← SQLAlchemy engine + session
│       ├── models/                ← ORM: Patient, Exam, AIResult, Report
│       ├── schemas/               ← Pydantic: validação de entrada/saída
│       ├── api/routes/            ← patients, exams, reports, stats
│       ├── services/
│       │   ├── ai_service.py      ← Pipeline de classificação
│       │   ├── dicom_service.py   ← Leitura e conversão DICOM
│       │   └── storage_service.py ← Armazenamento local / Supabase
│       └── tasks/
│           ├── celery_app.py      ← Configuração Celery
│           └── celery_tasks.py    ← Task analyze_exam
└── frontend/
    ├── Dockerfile
    ├── app/
    │   ├── dashboard/page.tsx     ← Cards + fila priorizada
    │   ├── upload/page.tsx        ← Formulário de upload em 3 etapas
    │   └── exams/[id]/page.tsx    ← Visor de imagem + achados IA + laudo
    ├── components/
    │   ├── dashboard/             ← StatsCards, ExamQueue, UrgencyBadge
    │   ├── exam/                  ← ExamViewer, AIFindings
    │   └── upload/                ← UploadForm
    └── lib/
        ├── types.ts               ← Tipos TypeScript + configs de urgência
        ├── api.ts                 ← Axios client para a API
        └── utils.ts               ← cn(), formatDate(), formatConfidence()
```

---

## Banco de dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `patients` | Dados do paciente (nome, CPF, município) |
| `exams` | Exame com status, urgência e arquivo |
| `ai_results` | Resultado da IA com achados e auditoria completa |
| `reports` | Laudo do radiologista + concordância com a IA |

### View `v_fila_priorizada`
Retorna exames pendentes ordenados: CRÍTICO → PRIORITÁRIO → ELETIVO,
e dentro do mesmo nível por data de chegada (FIFO clínico).

---

## Auditoria e rastreabilidade

Cada análise da IA é persistida em `ai_results` com:
- Modelo e versão utilizados
- Score bruto de anomalia
- Achados com confiança individual
- Tempo de processamento
- Concordância do radiologista com a IA (no laudo)

---

## Deploy em produção

### Backend (Railway)
```bash
# Configure as variáveis de ambiente no painel do Railway
# DATABASE_URL, REDIS_URL, AI_MODE, SECRET_KEY
railway up
```

### Frontend (Vercel)
```bash
vercel --prod
# Configure: NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

---

## Contexto — Alagoas / Nordeste

- Interface projetada para telas menores (responsiva)
- Formulários simples, 3 etapas com progresso visual
- Aceita imagens comuns (JPG/PNG) além de DICOM — útil onde equipamentos antigos não geram DICOM
- Modo `demo` funciona sem internet após primeira instalação (resiliência a baixa conectividade)

---

## Importante

> A IA **sugere** urgência — ela nunca substitui o julgamento do radiologista.
> O laudo final, assinado digitalmente, é sempre de responsabilidade do médico.

---
