import json
import os

from openai import OpenAI, OpenAIError


class ExerciseGenerationError(Exception):
    pass


def generate_exercise(topic, difficulty):
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ExerciseGenerationError("OpenAI API key is missing.")

    client = OpenAI(
        api_key=api_key,
        timeout=30.0,
        max_retries=0,
    )

    prompt = (
        f"Create one {difficulty} Python exercise about {topic}.\n"
        "Keep the question focused on the topic.\n"
        "The program must print a deterministic result.\n"
        "Do not use input(), files, packages or randomness.\n"
        "Return JSON with these fields:\n"
        "title: short exercise title\n"
        "instructions: clear question for the student\n"
        "starter_code: initial code for the editor\n"
        "reference_solution: working Python solution\n"
        "test_cases: array with one object containing expected_output\n"
        "hints: array of exactly three progressive hints\n"
        "Hint 1: small clue.\n"
        "Hint 2: detailed approach without full code.\n"
        "Hint 3: complete solution with explanation.\n"
        "Do not reveal the answer in the question."
    )

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            messages=[
                {
                    "role": "system",
                    "content": "Create clear Python programming exercises.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=1100,
        )

        content = response.choices[0].message.content

        if not content:
            raise ExerciseGenerationError("AI returned no content.")

        exercise = json.loads(content)

        for field in (
            "title",
            "instructions",
            "starter_code",
            "reference_solution",
        ):
            if not isinstance(exercise.get(field), str):
                raise ExerciseGenerationError(
                    f"Invalid field: {field}"
                )

        tests = exercise.get("test_cases")
        hints = exercise.get("hints")

        if (
            not isinstance(tests, list)
            or len(tests) != 1
            or not isinstance(tests[0], dict)
            or not isinstance(tests[0].get("expected_output"), str)
        ):
            raise ExerciseGenerationError("Invalid test cases.")

        if (
            not isinstance(hints, list)
            or len(hints) != 3
            or not all(isinstance(hint, str) for hint in hints)
        ):
            raise ExerciseGenerationError("Invalid hints.")

        return exercise

    except (OpenAIError, ValueError, KeyError, IndexError) as error:
        raise ExerciseGenerationError(
            "Exercise generation failed."
        ) from error
