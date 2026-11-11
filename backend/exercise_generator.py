import random


def generate_exercise():
    exercises = [
        {
            "topic": "Variables",
            "difficulty": "beginner",
            "question": "Create a variable called age and assign 20 to it.",
            "expected_output": None,
        },
        {
            "topic": "Loops",
            "difficulty": "beginner",
            "question": "Print numbers from 1 to 5 using a for loop.",
            "expected_output": "1\n2\n3\n4\n5",
        },
        {
            "topic": "Functions",
            "difficulty": "beginner",
            "question": "Write a function that adds two numbers.",
            "expected_output": None,
        },
    ]
    return random.choice(exercises)

if __name__ == "__main__":
    exercise = generate_exercise()


print("Topic:", exercise["topic"])
print("Difficulty:", exercise["difficulty"])
print("Question:", exercise["question"])