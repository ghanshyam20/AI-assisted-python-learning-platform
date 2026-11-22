import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { getExerciseHint } from './practiceApi'
import './ExerciseHints.css'

type ExerciseHintsProps = {
  exerciseId: number
  children: (
    hintButton: React.ReactNode,
    hintContent: React.ReactNode,
  ) => React.ReactNode
}

export function ExerciseHints({
  exerciseId,
  children,
}: ExerciseHintsProps) {
  const [hints, setHints] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function revealHint() {
    if (loading || hints.length >= 3) return

    setLoading(true)
    setError('')

    try {
      const result = await getExerciseHint(exerciseId)
      setHints((previous) => [...previous, result.hint])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to get a hint.'
      )
    } finally {
      setLoading(false)
    }
  }

  const hintButton = (
    <button
      type="button"
      className="exercise-hints__button"
      onClick={revealHint}
      disabled={loading || hints.length >= 3}
    >
      <Lightbulb size={16} />
      {loading
        ? 'Loading...'
        : hints.length >= 3
          ? 'All hints revealed'
          : `Get Hint ${hints.length + 1}`}
    </button>
  )

  const hintContent = hints.length > 0 || error ? (
    <section className="exercise-hints__list" aria-label="Exercise hints">
      {hints.map((hint, index) => (
        <div className="exercise-hints__item" key={index}>
          <strong>
            {index === 2 ? 'Complete solution' : `Hint ${index + 1}`}
          </strong>
          <pre>{hint}</pre>
        </div>
      ))}

      {error && <p role="alert">{error}</p>}
    </section>
  ) : null

  return <>{children(hintButton, hintContent)}</>
}
