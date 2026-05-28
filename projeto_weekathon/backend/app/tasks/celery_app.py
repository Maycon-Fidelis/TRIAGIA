from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "radia",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.celery_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Maceio",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={"app.tasks.celery_tasks.analyze_exam": {"queue": "ai_analysis"}},
    task_time_limit=300,          # 5 min máx por exame
    task_soft_time_limit=240,
)
