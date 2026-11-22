from django.db import transaction
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_quota import (
    AIQuotaExceeded,
    finish_ai_request,
    reserve_ai_request,
)
from .exercise_generator import (
    ExerciseGenerationError,
    generate_exercise,
)
from .models import Exercise, Lesson


class GenerateExerciseSerializer(serializers.Serializer):
    topic = serializers.ChoiceField(
        choices=[
            "introduction",
            "variables",
            "operators",
            "conditions",
            "loops",
            "data_structures",
            "functions",
            "errors_and_files",
        ]
    )
    difficulty = serializers.ChoiceField(
        choices=["beginner", "intermediate", "advanced"]
    )
    lesson_slug = serializers.SlugField(required=False)


class GenerateExerciseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GenerateExerciseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        topic = serializer.validated_data["topic"]
        difficulty = serializer.validated_data["difficulty"]
        lesson_slug = serializer.validated_data.get("lesson_slug")

        lesson = None

        if lesson_slug:
            lesson = Lesson.objects.filter(
                slug=lesson_slug,
                published=True,
                chapter__published=True,
            ).first()

            if lesson is None:
                return Response(
                    {"detail": "Lesson not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            topic = lesson.title

        try:
            usage = reserve_ai_request(request.user)
        except AIQuotaExceeded as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            content = generate_exercise(topic, difficulty)

            with transaction.atomic():
                exercise = Exercise.objects.create(
                    student=request.user,
                    lesson=lesson,
                    topic=topic,
                    difficulty=difficulty,
                    title=content["title"][:200],
                    instructions=content["instructions"],
                    starter_code=content["starter_code"],
                    reference_solution=content["reference_solution"],
                    test_cases=content["test_cases"],
                    hints=content["hints"],
                )
                finish_ai_request(usage, succeeded=True)

        except ExerciseGenerationError:
            finish_ai_request(usage, succeeded=False)
            return Response(
                {"detail": "Could not generate an exercise. Try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            finish_ai_request(usage, succeeded=False)
            raise

        return Response(
            {
                "id": exercise.id,
                "title": exercise.title,
                "instructions": exercise.instructions,
                "starter_code": exercise.starter_code,
                "topic": exercise.topic,
                "difficulty": exercise.difficulty,
            },
            status=status.HTTP_201_CREATED,
        )


class ExerciseHintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exercise_id):
        exercise = Exercise.objects.filter(
            id=exercise_id,
            student=request.user,
        ).first()

        if exercise is None:
            return Response(
                {"detail": "Exercise not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            exercise = Exercise.objects.select_for_update().get(
                id=exercise.id,
                student=request.user,
            )

            if exercise.hint_level >= 3:
                return Response(
                    {
                        "hint_level": exercise.hint_level,
                        "hint": "All hints have been revealed.",
                    }
                )

            next_level = exercise.hint_level + 1

            if next_level > len(exercise.hints):
                return Response(
                    {"detail": "No more hints available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            exercise.hint_level = next_level
            exercise.save(update_fields=["hint_level"])

        return Response(
            {
                "hint_level": next_level,
                "hint": (
                    exercise.reference_solution
                    if next_level == 3
                    else exercise.hints[next_level - 1]
                ),
            }
        )
