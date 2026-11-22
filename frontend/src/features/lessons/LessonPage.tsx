import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LessonContent } from './LessonContent'
import { LessonTipCard } from './LessonTipCard'
import { LessonNavigation } from './LessonNavigation'
import { PythonEditor } from './components/PythonEditor'
import { learningApi, type Chapter, type Lesson } from './learningApi'
import './LessonPage.css'

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return

    let active = true

    Promise.all([
      learningApi.lesson(slug),
      learningApi.chapters(),
    ])
      .then(([lessonData, chapterData]) => {
        if (!active) return
        setLesson(lessonData)
        setChapters(chapterData)
        setError('')
      })
      .catch((err: unknown) => {
        if (active) {
          setLesson(null)
          setError(err instanceof Error ? err.message : 'Unable to load lesson.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [slug])

  if (loading || (lesson && lesson.slug !== slug)) {
    return <section className="lesson-page"><p>Loading lesson...</p></section>
  }

  if (error || !lesson) {
    return (
      <section className="lesson-page">
        <h1>Lesson unavailable</h1>
        <p role="alert">{error || 'Lesson not found.'}</p>
        <Link to="/lessons">Back to lessons</Link>
      </section>
    )
  }

  const chapterIndex = chapters.findIndex(
    (chapter) => chapter.id === lesson.chapter
  )
  const chapter = chapters[chapterIndex]
  const lessons = chapter?.lessons ?? []
  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id)

  const previous = lessonIndex > 0 ? lessons[lessonIndex - 1] : undefined
  const next = lessonIndex >= 0 ? lessons[lessonIndex + 1] : undefined

  return (
    <div className="lesson-page">
      <Link to="/lessons" className="lesson-page__back">
        <ArrowLeft size={16} />
        All lessons
      </Link>

      <div className="lesson-page__heading">
        <span className="lesson-page__eyebrow">
          CHAPTER {String(chapterIndex + 1).padStart(2, '0')}
          {' / '}
          LESSON {String(lessonIndex + 1).padStart(2, '0')}
        </span>
        <h1>{lesson.title}</h1>
        <p>{lesson.introduction}</p>
      </div>

      <LessonContent
        title={lesson.title}
        introduction={lesson.introduction}
        objectives={lesson.objectives}
        explanation={lesson.explanation}
        exampleCode={lesson.example_code}
        exampleExplanation={lesson.example_explanation}
      />

      {lesson.tip && (
        <LessonTipCard
          title={lesson.tip_title || 'Python tip'}
          tip={lesson.tip}
          example={lesson.tip_example}
        />
      )}

      <div className="lesson-page__challenge">
        <span className="lesson-page__eyebrow">TRY IT YOURSELF</span>
        <h2>Python playground</h2>
        <p>
          Edit the example and run your code. Graded challenges will
          be available through the Practice workspace.
        </p>
      </div>

      <PythonEditor
        key={lesson.slug}
        initialCode={lesson.starter_code || lesson.example_code}
      />

      <LessonNavigation
        chapterTitle={chapter?.title ?? lesson.chapter_title}
        lessonTitle={lesson.title}
        currentLesson={lessonIndex + 1}
        totalLessons={lessons.length}
        onPrevious={
          previous ? () => navigate(`/lessons/${previous.slug}`) : undefined
        }
        onNext={
          next ? () => navigate(`/lessons/${next.slug}`) : undefined
        }
      />
    </div>
  )
}
