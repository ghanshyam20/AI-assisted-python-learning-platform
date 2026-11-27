import os
from datetime import datetime, time, timedelta

from django.db import connection, transaction
from django.utils import timezone

from .models import AIUsage


class AIQuotaExceeded(Exception):
    pass


def reserve_ai_request(student):
    student_limit = int(
        os.getenv("AI_REQUESTS_PER_STUDENT_DAY", "5")
    )
    project_limit = int(
        os.getenv("AI_REQUESTS_PROJECT_DAY", "100")
    )

    today = timezone.localdate()
    start = timezone.make_aware(
        datetime.combine(today, time.min)
    )
    end = start + timedelta(days=1)

    with transaction.atomic():
        # Lock all AI reservations across the project.
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT pg_advisory_xact_lock(%s)",
                [82731001],
            )

        student_used = AIUsage.objects.filter(
            student=student,
            created_at__gte=start,
            created_at__lt=end,
            status__in=["reserved", "completed"],
        ).count()

        project_used = AIUsage.objects.filter(
            created_at__gte=start,
            created_at__lt=end,
            status__in=["reserved", "completed"],
        ).count()

        if student_used >= student_limit:
            raise AIQuotaExceeded(
                "You have reached your daily AI request limit."
            )

        if project_used >= project_limit:
            raise AIQuotaExceeded(
                "PyLearn has reached its daily AI request limit."
            )

        return AIUsage.objects.create(student=student)


def finish_ai_request(usage, succeeded):
    usage.status = "completed" if succeeded else "failed"
    usage.save(update_fields=["status"])
