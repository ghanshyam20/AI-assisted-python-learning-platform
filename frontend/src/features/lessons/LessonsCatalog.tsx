import { useState } from ‘react’
import { BookOpen, ChevronDown, ChevronRight, Clock3, Code2 } from ‘lucide-react’
import ‘./LessonsCatalog.css’

type Chapter = {
title: string
description: string
lessons: string[]
}

const chapters: Chapter[] = [
{
title: ‘Getting Started with Python’,
description: ‘Understand Python and write your first program.’,
lessons: [‘Introduction to Python’, ‘Your First Python Program’, ‘Comments and Basic Syntax’],
},
{
title: ‘Variables and Data Types’,
description: ‘Learn how Python stores and works with information.’,
lessons: [‘Variables’, ‘Numbers’, ‘Strings’, ‘Booleans’],
},
{
title: ‘Operators and User Input’,
description: ‘Work with calculations, comparisons and input.’,
lessons: [‘Python Operators’, ‘Comparisons’, ‘Getting User Input’],
},
{
title: ‘Conditions’,
description: ‘Make decisions using conditional statements.’,
lessons: [‘If Statements’, ‘Else and Elif’, ‘Logical Conditions’, ‘Nested Conditions’],
},
{
title: ‘Loops’,
description: ‘Repeat tasks without writing the same code again.’,
lessons: [‘For Loops’, ‘While Loops’, ‘Range’, ‘Break and Continue’],
},
{
title: ‘Data Structures’,
description: ‘Organize collections of information.’,
lessons: [‘Lists’, ‘Tuples’, ‘Dictionaries’, ‘Sets’, ‘Working with Collections’],
},
{
title: ‘Functions’,
description: ‘Write reusable and organized Python code.’,
lessons: [‘Defining Functions’, ‘Parameters’, ‘Return Values’, ‘Variable Scope’],
},
{
title: ‘Errors and Files’,
description: ‘Handle common errors and work with files.’,
lessons: [‘Understanding Errors’, ‘Try and Except’, ‘Reading and Writing Files’],
},
]

export function LessonsCatalog() {
const [selectedChapter, setSelectedChapter] = useState<number | null>(0)
const lessonCount = chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)

return (
<section className=“lessons-catalog”>
<header className=“lessons-header”>
<span className=“lessons-eyebrow”>PYLEARN / LEARNING PATH</span>
<h1>Python Fundamentals</h1>
<p>
Learn Python from the beginning. Explore chapters, understand the topics,
and get ready for coding practice.
</p>
<div className=“lessons-summary”>
<span><BookOpen size={16} /> {chapters.length} chapters</span>
<span><Code2 size={16} /> {lessonCount} lessons planned</span>
<span><Clock3 size={16} /> Beginner level</span>
</div>
</header>

  <div className="lessons-content">
    <div className="lessons-section-heading">
      <div>
        <h2>Course chapters</h2>
        <p>Select a chapter to see its lessons.</p>
      </div>
    </div>

    <div className="lessons-chapter-list">
      {chapters.map((chapter, index) => {
        const isSelected = selectedChapter === index

        return (
          <article
            className={`lessons-chapter ${isSelected ? 'lessons-chapter--selected' : ''}`}
            key={chapter.title}
          >
            <button
              type="button"
              className="lessons-chapter-button"
              aria-expanded={isSelected}
              onClick={() => setSelectedChapter(isSelected ? null : index)}
            >
              <span className="lessons-chapter-number">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="lessons-chapter-info">
                <strong>{chapter.title}</strong>
                <span>{chapter.description}</span>
                <small>{chapter.lessons.length} lessons</small>
              </span>

              <ChevronDown
                size={20}
                className={isSelected ? 'lessons-chevron--open' : ''}
              />
            </button>

            {isSelected && (
              <div className="lessons-chapter-details">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <div className="lessons-lesson-row" key={lesson}>
                    <span className="lessons-lesson-number">
                      {String(lessonIndex + 1).padStart(2, '0')}
                    </span>
                    <span>{lesson}</span>
                    <span className="lessons-coming-soon">
                      Planned
                      <ChevronRight size={15} aria-hidden="true" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </div>
  </div>

  <p className="lessons-footnote">
    Course outline preview. Lesson content and completion tracking will be connected
    as development continues.
  </p>
</section>

)
}
