import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Search,
} from 'lucide-react'
import { learningApi, type Chapter } from './learningApi'
import './LessonsCatalog.css'

const LAST_LESSON_KEY = 'pylearn:last-opened-lesson'

export function LessonsCatalog() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastLessonSlug, setLastLessonSlug] = useState(
    () => localStorage.getItem(LAST_LESSON_KEY) ?? '',
  )

  useEffect(() => {
    let active = true
    learningApi.chapters()
      .then((data) => {
        if (!active) return
        setChapters(data)
        setSelectedChapter(data[0]?.id ?? null)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load chapters.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const totalLessons = chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)
  const allLessons = chapters.flatMap((chapter) => chapter.lessons)
  const lastLesson = allLessons.find((lesson) => lesson.slug === lastLessonSlug)
  const featuredLesson = lastLesson ?? allLessons[0]

  const filteredChapters = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return chapters
    return chapters
      .map((chapter) => {
        const chapterMatches =
          chapter.title.toLowerCase().includes(query) ||
          chapter.description.toLowerCase().includes(query)
        return chapterMatches
          ? chapter
          : {
              ...chapter,
              lessons: chapter.lessons.filter((lesson) =>
                lesson.title.toLowerCase().includes(query),
              ),
            }
      })
      .filter((chapter) =>
        chapter.lessons.length > 0 ||
        chapter.title.toLowerCase().includes(query) ||
        chapter.description.toLowerCase().includes(query),
      )
  }, [chapters, search])

  function rememberLesson(slug: string) {
    localStorage.setItem(LAST_LESSON_KEY, slug)
    setLastLessonSlug(slug)
  }

  return (
    <section className="lessons-catalog">
      <header className="lessons-header">
        <span className="lessons-eyebrow">PYLEARN / LEARNING PATH</span>
        <h1>Python Fundamentals</h1>
        <p>
          Learn Python step by step. Start with the basics, explore lessons,
          and build confidence through practice.
        </p>
        <div className="lessons-summary">
          <span><Clock3 size={16} /> Beginner friendly</span>
          <span><BookOpen size={16} /> {chapters.length} chapters</span>
          <span><CheckCircle2 size={16} /> {totalLessons} lessons</span>
        </div>
      </header>

      <div className="lessons-content">
        {!loading && !error && featuredLesson && (
          <div className="pylearn-resume">
            <div className="pylearn-resume-icon"><BookOpen size={22} /></div>
            <div className="pylearn-resume-info">
              <span className="pylearn-resume-label">
                {lastLesson ? 'CONTINUE LEARNING' : 'START LEARNING'}
              </span>
              <h2>{featuredLesson.title}</h2>
              <p>
                {lastLesson
                  ? 'Return to your recently opened lesson.'
                  : 'Begin your Python learning journey.'}
              </p>
            </div>
            <Link
              className="pylearn-resume-button"
              to={`/lessons/${featuredLesson.slug}`}
              onClick={() => rememberLesson(featuredLesson.slug)}
            >
              {lastLesson ? 'Continue' : 'Start lesson'} <ArrowRight size={17} />
            </Link>
          </div>
        )}

        <div className="pylearn-catalog-toolbar">
          <div>
            <h2>Course Chapters</h2>
            <p>Choose a chapter and explore its published lessons.</p>
          </div>
          <label className="pylearn-catalog-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search chapters or lessons"
              aria-label="Search chapters or lessons"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {loading && <p role="status">Loading chapters...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && chapters.length === 0 && (
          <div className="pylearn-catalog-empty">
            <BookOpen size={28} />
            <h3>No published chapters yet</h3>
            <p>Published chapters and lessons from the admin panel will appear here automatically.</p>
          </div>
        )}
        {!loading && !error && chapters.length > 0 && filteredChapters.length === 0 && (
          <div className="pylearn-catalog-empty">
            <Search size={28} />
            <h3>No matching lessons</h3>
            <p>Try searching for another topic.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="lessons-chapter-list">
            {filteredChapters.map((chapter) => {
              const originalIndex = chapters.findIndex((item) => item.id === chapter.id)
              const isSelected = search.trim().length > 0 || selectedChapter === chapter.id
              return (
                <article
                  className={`lessons-chapter ${isSelected ? 'lessons-chapter--selected' : ''}`}
                  key={chapter.id}
                >
                  <button
                    type="button"
                    className="lessons-chapter-button"
                    aria-expanded={isSelected}
                    onClick={() => {
                      if (search.trim()) {
                        setSearch('')
                        setSelectedChapter(chapter.id)
                      } else {
                        setSelectedChapter(isSelected ? null : chapter.id)
                      }
                    }}
                  >
                    <span className="lessons-chapter-number">
                      {String(originalIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="lessons-chapter-info">
                      <strong>{chapter.title}</strong>
                      <span>{chapter.description}</span>
                      <small>
                        {chapter.lessons.length} {chapter.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </small>
                    </span>
                    <ChevronDown size={20} className={isSelected ? 'lessons-chevron--open' : ''} />
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
                            onClick={() => rememberLesson(lesson.slug)}
                          >
                            {lesson.title}
                          </Link>
                          <Link
                            to={`/lessons/${lesson.slug}`}
                            className="lessons-coming-soon"
                            aria-label={`Open ${lesson.title}`}
                            onClick={() => rememberLesson(lesson.slug)}
                          >
                            Open <ChevronRight size={15} aria-hidden="true" />
                          </Link>
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
        )}
      </div>
    </section>
  )
}