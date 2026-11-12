"""Beginner-friendly Python learning tips."""

LEARNING_TIPS = [
    {
        "topic": "Variables",
        "tip": "Use meaningful names to make your code easier to read.",
        "example": "student_age = 20",
    },
    {
        "topic": "Loops",
        "tip": "Use a for loop when you want to repeat an action.",
        "example": "for number in range(5):\n    print(number)",
    },
    {
        "topic": "Functions",
        "tip": "Use functions to organize reusable code.",
        "example": "def greet(name):\n    return f'Hello, {name}!'",
    },
    {
        "topic": "Lists",
        "tip": "Lists store multiple values in one variable.",
        "example": "scores = [80, 90, 75]",
    },
]


def get_learning_tips(topic=None):
    """Return all tips or filter by topic."""
    if topic is None:
        return LEARNING_TIPS

    return [
        tip for tip in LEARNING_TIPS
        if tip["topic"].lower() == topic.lower()
    ]


if __name__ == "__main__":
    for tip in get_learning_tips():
        print(f"\nTopic: {tip['topic']}")
        print(f"Tip: {tip['tip']}")
        print(f"Example:\n{tip['example']}")