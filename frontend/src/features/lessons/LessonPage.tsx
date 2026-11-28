import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { LessonContent } from './LessonContent'
import { LessonTipCard } from './LessonTipCard'
import { LessonNavigation } from './LessonNavigation'
import { LessonAIAssistant } from './LessonAIAssistant'
import { PythonEditor } from './components/PythonEditor'
import { generateExercise, type GeneratedExercise } from '../practice/practiceApi'
import { learningApi, type Chapter, type Lesson, type PageBlock } from './learningApi'
import './LessonPage.css'
import SafeRichText from './SafeRichText'

function ContentBlock({ block }: { block: PageBlock }) {
  const rich = <SafeRichText value={block.content} />
  switch (block.block_type) {
    case 'heading': return <div className="lesson-page__rich-heading">{rich}</div>
    case 'paragraph': return <div className="lesson-page__rich-text">{rich}</div>
    case 'bullets':
    case 'numbered': {
      // Keep lists created with TipTap, including their inline formatting.
      if (/<(?:ul|ol|li)\b/i.test(block.content)) {
        return <div className="lesson-page__rich-text">{rich}</div>
      }

      // Older lessons may contain separate paragraphs instead of list items.
      const hasHtml = /<[a-z][\s\S]*>/i.test(block.content)
      const text = hasHtml
        ? Array.from(new DOMParser().parseFromString(block.content, 'text/html').body.querySelectorAll('p')).map((p) => p.textContent || '').join('\n')
        : block.content

      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

      const items = lines.map((line, index) => (
        <li key={index}>{line.replace(/^([-*]|\d+[.)])\s*/, '')}</li>
      ))

      return block.block_type === 'bullets' ? <ul>{items}</ul> : <ol>{items}</ol>
    }
    case 'code': return <pre className="lesson-page__code"><code>{block.content}</code></pre>
    case 'output': return <div className="lesson-page__output"><strong>Expected output</strong><pre>{block.content}</pre></div>
    case 'tip': return <aside className="lesson-page__callout lesson-page__callout--tip"><strong>Tip</strong>{rich}</aside>
    case 'note': return <aside className="lesson-page__callout"><strong>Note</strong>{rich}</aside>
    default: return <div className="lesson-page__rich-text">{rich}</div>
  }
}

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generatedExercise, setGeneratedExercise] = useState<GeneratedExercise | null>(null)
  const [generatingExercise, setGeneratingExercise] = useState(false)
  const [exerciseError, setExerciseError] = useState('')

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setError('Lesson not found.')
      return
    }
    let active = true
    setLoading(true)
    setError('')
    setPageIndex(0)
    setGeneratedExercise(null)
    setExerciseError('')
    Promise.all([learningApi.lesson(slug), learningApi.chapters()])
      .then(([lessonData, chapterData]) => {
        if (!active) return
        setLesson(lessonData)
        setChapters(chapterData)
      })
      .catch((err: unknown) => {
        if (!active) return
        setLesson(null)
        setError(err instanceof Error ? err.message : 'Unable to load lesson.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  if (loading || (lesson && lesson.slug !== slug && !error)) {
    return <section className="lesson-page"><p role="status">Loading lesson...</p></section>
  }
  if (error || !lesson) {
    return <section className="lesson-page"><h1>Lesson unavailable</h1><p role="alert">{error || 'Lesson not found.'}</p><Link to="/lessons">Back to lessons</Link></section>
  }

  const chapterIndex = chapters.findIndex((chapter) => chapter.id === lesson.chapter)
  const chapter = chapters[chapterIndex]
  const lessons = chapter?.lessons ?? []
  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id)
  const previous = lessonIndex > 0 ? lessons[lessonIndex - 1] : undefined
  const next = lessonIndex >= 0 ? lessons[lessonIndex + 1] : undefined
  const pages = [...(lesson.pages ?? [])].sort((a, b) => a.position - b.position || a.id - b.id)
  const activePage = pages[pageIndex]
  const hasPages = pages.length > 0

  async function handleGenerateLessonExercise() {
    if (generatingExercise || !slug) return
    setGeneratingExercise(true)
    setExerciseError('')
    try {
      const result = await generateExercise({
        topic: 'introduction',
        difficulty: 'beginner',
        lesson_slug: slug,
      })
      setGeneratedExercise(result)
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Exercise generation failed.')
    } finally {
      setGeneratingExercise(false)
    }
  }

  const showPractice = !hasPages || pageIndex === pages.length - 1

  return (
    <div className="lesson-page">
      <Link to="/lessons" className="lesson-page__back"><ArrowLeft size={16} /> All lessons</Link>
      <div className="lesson-page__heading">
        <span className="lesson-page__eyebrow">
          {chapterIndex >= 0 ? `CHAPTER ${String(chapterIndex + 1).padStart(2, '0')}` : lesson.chapter_title}
          {' / '}
          {lessonIndex >= 0 ? `LESSON ${String(lessonIndex + 1).padStart(2, '0')}` : 'LESSON'}
        </span>
        <h1>{lesson.title}</h1>
        {lesson.introduction && <p>{lesson.introduction}</p>}
      </div>

      {hasPages ? (
        <section aria-label="Lesson reading content" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {pages.map((page, index) => (
              <button key={page.id} type="button" onClick={() => setPageIndex(index)} aria-current={index === pageIndex ? 'step' : undefined}
                style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #cbd5e1', cursor: 'pointer', background: index === pageIndex ? '#1d4ed8' : '#fff', color: index === pageIndex ? '#fff' : '#1e293b' }}>
                {index + 1}. {page.title || `Page ${index + 1}`}
              </button>
            ))}
          </div>
          {activePage && (
            <article key={activePage.id} style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 16, background: '#fff' }}>
              <p className="lesson-page__eyebrow">PAGE {pageIndex + 1} OF {pages.length}</p>
              <h2>{activePage.title}</h2>
              {[...activePage.blocks].sort((a, b) => a.position - b.position).map((block) => <ContentBlock key={block.id} block={block} />)}
              {activePage.blocks.length === 0 && <p>This page has no published content yet.</p>}
            </article>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
            <button type="button" disabled={pageIndex === 0} onClick={() => setPageIndex((index) => Math.max(0, index - 1))}><ChevronLeft size={16} /> Previous page</button>
            <button type="button" disabled={pageIndex === pages.length - 1} onClick={() => setPageIndex((index) => Math.min(pages.length - 1, index + 1))}>Next page <ChevronRight size={16} /></button>
          </div>
        </section>
      ) : (
        <>
          <LessonContent title={lesson.title} introduction={lesson.introduction} objectives={lesson.objectives} explanation={lesson.explanation} exampleCode={lesson.example_code} exampleExplanation={lesson.example_explanation} />
          {lesson.tip && <LessonTipCard title={lesson.tip_title || 'Python tip'} tip={lesson.tip} example={lesson.tip_example} />}
        </>
      )}

      <LessonAIAssistant
        slug={slug || ''}
        pageId={hasPages ? pages[pageIndex]?.id : undefined}
      />
      {showPractice && (<>
      {(
        <section aria-label="Lesson coding exercise" style={{ marginTop: 28 }}>
          <div className="lesson-page__challenge">
            <span className="lesson-page__eyebrow">AI-ASSISTED PRACTICE</span>
            <h2>Apply what you learned</h2>
            <p>Generate a beginner Python challenge based on this lesson. Run your code and reveal hints if you need help.</p>
            <button type="button" onClick={() => void handleGenerateLessonExercise()} disabled={generatingExercise}>
              {generatingExercise ? 'Generating exercise...' : 'Generate AI exercise for this lesson'}
            </button>
            {exerciseError && <p role="alert">{exerciseError}</p>}
          </div>
          {generatedExercise ? (
            <div style={{ marginTop: 18 }}>
              <h3>{generatedExercise.title}</h3>
              <p>{generatedExercise.instructions}</p>
              <PythonEditor
                key={generatedExercise.id}
                initialCode={generatedExercise.starter_code}
                exerciseId={generatedExercise.id}
              />
              <p style={{ fontSize: 13, opacity: 0.8 }}>
                Run Code is for experimenting. Verified submission and XP will be enabled after server-side grading is implemented.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: 18 }}>
              <h3>Python playground</h3>
              <p>Experiment freely, or generate an AI challenge above.</p>
              <PythonEditor key={lesson.slug} initialCode={lesson.starter_code || lesson.example_code || '# Write your Python code here\n'} />
            </div>
          )}
        </section>
      )}
      <LessonNavigation
        chapterTitle={chapter?.title ?? lesson.chapter_title}
        lessonTitle={lesson.title}
        currentLesson={lessonIndex + 1}
        totalLessons={lessons.length}
        onPrevious={previous ? () => navigate(`/lessons/${previous.slug}`) : undefined}
        onNext={next ? () => navigate(`/lessons/${next.slug}`) : undefined}
      />
      </>)}
      {next && <p style={{ textAlign: 'right' }}><Link to={`/lessons/${next.slug}`}>Next lesson <ArrowRight size={14} /></Link></p>}
    </div>
  )
}
