import { useState } from ‘react’
import { Lightbulb, ChevronDown } from ‘lucide-react’
import ‘./LessonTipCard.css’

type LessonTipCardProps = {
  title: string
  tip: string
  example: string
}

export function LessonTipCard({
  title,
  tip,
  example,
}: LessonTipCardProps) {
  const [showExample, setShowExample] = useState(false)

  return (
    <aside className=“lesson-tip-card”>
      <div className=“lesson-tip-card__header”>
        <Lightbulb size={20} />
        <span>QUICK PYTHON TIP</span>
      </div>

      <h3>{title}</h3>
      <p>{tip}</p>

      <button
        type=“button”
        onClick={() => setShowExample(!showExample)}
        aria-expanded={showExample}
      >
        {showExample ? ‘Hide example’ : ‘Show example’}
        <ChevronDown size={16} />
      </button>

      {showExample && (
        <pre className=“lesson-tip-card__example”>
          <code>{example}</code>
        </pre>
      )}
    </aside>
  )
}