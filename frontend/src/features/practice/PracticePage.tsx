import { useState } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { PythonEditor } from '../lessons/components/PythonEditor'
import {
  generateExercise,
  type GeneratedExercise,
} from './practiceApi'
import './PracticePage.css'

const topics = [
  { value: 'introduction', label: 'Introduction to Python' },
  { value: 'variables', label: 'Variables and Data Types' },
  { value: 'operators', label: 'Operators' },
  { value: 'conditions', label: 'Conditional Statements' },
  { value: 'loops', label: 'Loops' },
  { value: 'data_structures', label: 'Data Structures' },
  { value: 'functions', label: 'Functions' },
  { value: 'errors_and_files', label: 'Errors and Files' },
]

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export function PracticePage() {
  const [topic, setTopic] = useState('variables')
  const [difficulty, setDifficulty] = useState('beginner')
  const [exercise, setExercise] = useState<GeneratedExercise | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const result = await generateExercise({ topic, difficulty })
      setExercise(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate an exercise.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="practice-page">
      <div className="practice-page__heading">
        <h1>Coding Practice</h1>
        <p>Choose a topic and solve a new Python challenge.</p>
      </div>

      <section className="practice-page__controls">
        <div className="practice-page__field">
          <label htmlFor="practice-topic">Python topic</label>
          <select
            id="practice-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            {topics.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="practice-page__field">
          <label htmlFor="practice-difficulty">Difficulty</label>
          <select
            id="practice-difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            {difficulties.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="practice-page__generate"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle size={17} />
          ) : (
            <Sparkles size={17} />
          )}
          {loading ? 'Generating...' : 'Generate exercise'}
        </button>
      </section>

      {error && (
        <p className="practice-page__error" role="alert">
          {error}
        </p>
      )}

      {exercise ? (
        <div className="practice-page__exercise">
          <section className="practice-page__question">
            <span className="practice-page__eyebrow">
              AI-GENERATED CHALLENGE
            </span>
            <h2>{exercise.title}</h2>
            <p>{exercise.instructions}</p>
          </section>

          <PythonEditor
            key={exercise.id}
            initialCode={exercise.starter_code}
            exerciseId={exercise.id}
          />
        </div>
      ) : (
        <section className="practice-page__empty">
          <Sparkles size={28} />
          <h2>Ready to practice?</h2>
          <p>
            Select a Python topic and difficulty to generate
            your first challenge.
          </p>
        </section>
      )}
    </main>
  )
}
