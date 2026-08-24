"""RailMadad AI Platform — Celery Application."""

from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "railmadad",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,
    beat_schedule={
        "check-sla-violations": {
            "task": "app.tasks.admin.check_sla_violations",
            "schedule": 300.0,  # every 5 minutes
        },
        "generate-daily-analytics": {
            "task": "app.tasks.analytics.generate_daily_report",
            "schedule": 86400.0,  # daily
        },
    },
)

# Auto-discover tasks in all app.tasks.* modules
celery_app.autodiscover_tasks(["app.tasks"])
