import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import engine, Base
from app.api.routes import patients, exams, reports, stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria tabelas se ainda não existem (fallback — o docker usa o .sql)
    Base.metadata.create_all(bind=engine)
    # Garante diretório de storage
    Path(settings.storage_path).joinpath("originals").mkdir(parents=True, exist_ok=True)
    Path(settings.storage_path).joinpath("processed").mkdir(parents=True, exist_ok=True)
    logger.info("RadIA backend iniciado")
    yield
    logger.info("RadIA backend encerrado")


app = FastAPI(
    title="RadIA API",
    description="Sistema inteligente de triagem de exames radiológicos para o SUS",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — permite o frontend Next.js se comunicar
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins + ["*"],  # restringir em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve imagens locais via HTTP (substituído por Supabase em produção)
storage_path = Path(settings.storage_path)
if storage_path.exists():
    app.mount("/storage", StaticFiles(directory=str(storage_path)), name="storage")

# Registra rotas
PREFIX = "/api/v1"
app.include_router(patients.router, prefix=PREFIX)
app.include_router(exams.router, prefix=PREFIX)
app.include_router(reports.router, prefix=PREFIX)
app.include_router(stats.router, prefix=PREFIX)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "RadIA", "version": "1.0.0"}
