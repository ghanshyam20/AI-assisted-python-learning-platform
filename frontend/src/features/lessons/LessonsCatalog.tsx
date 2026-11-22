import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Clock3 } from 'lucide-react'
import { learningApi, type Chapter } from './learningApi'
import './LessonsCatalog.css'

export function LessonsCatalog() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    learningApi.chapters()
      .then((data) => {
        if (!active) return
        setChapters(data)
        setSelectedChapter(data[0]?.id ?? null)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load chapters.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  return (
    <section className="lessons-catalog">
      <header className="lessons-header">
        <span className="lessons-eyebrow">PYLEARN / LEARNING PATH</span>
        <h1>Python Fundamentals</h1>
        <p>Learn Python step by step, practice concepts, and build your coding skills.</p>
        <div className="lessons-summary">
          <span><Clock3 size={16} /> Beginner level</span>
        </div>
      </header>

      <div className="lessons-content">
        <div className="lessons-section-heading">
          <div>
            <h2>Course chapters</h2>
            <p>Select a chapter to explore its published lessons.</p>
          </div>
        </div>

        {loading && <p role="status">Loading chapters...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && chapters.length === 0 && (
          <p>No published chapters yet. Add content through Django Admin.</p>
        )}

        <div className="lessons-chapter-list">
          {chapters.map((chapter, index) => {
            const isSelected = selectedChapter === chapter.id

            return (
              <article
                className={`lessons-chapter ${isSelected ? 'lessons-chapter--selected' : ''}`}
                key={chapter.id}
              >
                <button
                  type="button"
                  className="lessons-chapter-button"
                  aria-expanded={isSelected}
                  onClick={() =>
                    setSelectedChapter(isSelected ? null : chapter.id)
                  }
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
                      <div className="lessons-lesson-row" key={lesson.id}>
                        <span className="lessons-lesson-number">
                          {String(lessonIndex + 1).padStart(2, '0')}
                        </span>
                        <Link
                          to={`/lessons/${lesson.slug}`}
                          className="lessons-lesson-link"
                        >
                          {lesson.title}
                        </Link>
                        <span className="lessons-coming-soon">
                          Open <ChevronRight size={15} aria-hidden="true" />
                        </span>
                      </div>
                    ))}
                    {chapter.lessons.length === 0 && (
                      <p>No published lessons in this chapter yet.</p>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
