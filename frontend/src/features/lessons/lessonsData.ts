export type Lesson = {
  slug: string
  title: string
  introduction: string
  objectives: string[]
  explanation: string
  exampleCode: string
  exampleExplanation: string
  starterCode: string
  tipTitle: string
  tip: string
  tipExample: string
  challenge: string
  expectedOutput: string
}

export const chapterOneLessons: Lesson[] = [
  {
    slug: 'introduction-to-python',
    title: 'Introduction to Python',
    introduction:
      'Python is a programming language used to build websites, automate tasks, analyse data, and much more. You can start writing useful programs with just a few lines of code.',
    objectives: [
      'Understand what Python is used for',
      'Recognise a simple Python statement',
      'Run your first line of Python code',
    ],
    explanation:
      'A Python program is a set of instructions that a computer follows. One of the simplest instructions is print(), which displays information on the screen. Text must be placed inside quotation marks.',
    exampleCode: 'print("Hello, Python!")',
    exampleExplanation:
      'The print() function displays Hello, Python! in the output. The quotation marks tell Python that the value is text.',
    starterCode: 'print("Hello, Python!")',
    tipTitle: 'Text needs quotation marks',
    tip: 'When printing words or sentences, put them inside single or double quotation marks.',
    tipExample: 'print("Welcome to PyLearn")',
    challenge: 'Change the program to print Welcome to PyLearn.',
    expectedOutput: 'Welcome to PyLearn',
  },
  {
    slug: 'your-first-python-program',
    title: 'Your First Python Program',
    introduction:
      'A program can contain several instructions. Python runs them in order, from top to bottom.',
    objectives: [
      'Write multiple Python statements',
      'Understand execution order',
      'Display more than one line of output',
    ],
    explanation:
      'Each print() statement displays a new line. You can combine several statements to create a small program that introduces itself.',
    exampleCode: 'print("My first program")\nprint("I am learning Python")',
    exampleExplanation:
      'Python executes the first statement and then the second. Each print() produces its own line.',
    starterCode: 'print("My first program")\nprint("I am learning Python")',
    tipTitle: 'Read your code from top to bottom',
    tip: 'For simple programs, Python executes statements in the same order you write them.',
    tipExample: 'print("First")\nprint("Second")',
    challenge: 'Write two print() statements. The first should display Hello and the second should display Python.',
    expectedOutput: 'Hello\nPython',
  },
  {
    slug: 'comments-and-basic-syntax',
    title: 'Comments and Basic Syntax',
    introduction:
      'Readable code is easier to understand and maintain. Comments help explain what your program does.',
    objectives: [
      'Write comments using #',
      'Understand basic Python syntax',
      'Distinguish comments from executable code',
    ],
    explanation:
      'A comment begins with #. Python ignores comments when running a program. Comments are useful for explaining decisions or leaving notes for yourself and your teammates.',
    exampleCode: '# Display a welcome message\nprint("Welcome!")',
    exampleExplanation:
      'Python ignores the comment and executes only the print() statement.',
    starterCode: '# Write a comment here\nprint("Welcome!")',
    tipTitle: 'Comments are for people',
    tip: 'Use comments to explain why something happens rather than repeating what the code already says.',
    tipExample: '# Show a message to new students\nprint("Ready to learn!")',
    challenge: 'Keep a comment in your code and print Python is fun.',
    expectedOutput: 'Python is fun',
  },
]
