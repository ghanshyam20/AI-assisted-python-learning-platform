from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_quota import AIQuotaExceeded, finish_ai_request, reserve_ai_request
from .lesson_ai import ACTIONS, LessonAIError, generate_lesson_assistance
from .models import Lesson, LessonPage


class LessonAIRequestSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=list(ACTIONS))
    page_id = serializers.IntegerField(min_value=1, required=False)
    question = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    code = serializers.CharField(max_length=6000, required=False, allow_blank=True)

    def validate(self, data):
        if data["action"] == "tutor" and not data.get("question", "").strip():
            raise serializers.ValidationError({"question": "Enter a question."})
        if data["action"] in ("explain_code", "debug") and not data.get("code", "").strip():
            raise serializers.ValidationError({"code": "Enter Python code."})
        return data


class LessonAIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        serializer = LessonAIRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        lesson = Lesson.objects.filter(slug=slug, published=True, chapter__published=True).first()
        if lesson is None:
            return Response({"detail": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)
        page = None
        if "page_id" in data:
            page = LessonPage.objects.filter(id=data["page_id"], lesson=lesson, published=True).first()
            if page is None:
                return Response({"detail": "Published page not found."}, status=status.HTTP_404_NOT_FOUND)
        elif lesson.pages.filter(published=True).exists():
            return Response({"detail": "Select a published lesson page."}, status=status.HTTP_400_BAD_REQUEST)

        context = "\n".join([lesson.introduction, lesson.explanation, lesson.example_code])
        if page:
            blocks = page.blocks.order_by("position", "id")
            context += "\n" + "\n".join(f"{block.block_type}: {block.content}" for block in blocks)
        try:
            usage = reserve_ai_request(request.user)
        except AIQuotaExceeded as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        try:
            answer = generate_lesson_assistance(
                action=data["action"], lesson_title=lesson.title,
                page_title=page.title if page else lesson.title,
                context=context, question=data.get("question", ""), code=data.get("code", ""),
            )
        except LessonAIError as exc:
            finish_ai_request(usage, succeeded=False)
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            finish_ai_request(usage, succeeded=False)
            raise
        finish_ai_request(usage, succeeded=True)
        return Response({"action": data["action"], "answer": answer})
