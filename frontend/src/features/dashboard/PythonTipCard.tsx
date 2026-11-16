import { Lightbulb } from ‘lucide-react’
import ‘./PythonTipCard.css’

export function PythonTipCard() {
  return (
    <section className=“python-tip-card” aria-labelledby=“python-tip-title”>
      <div className=“python-tip-heading”>
        <Lightbulb size={20} aria-hidden=“true” />
        <h2 id=“python-tip-title”>Quick Python Tip</h2>
      </div>

      <p>
        Python uses indentation to group code blocks.
        Always keep your indentation consistent.
      </p>

      <pre>
        <code>{‘if True:\n    print(“Hello, Python!”)‘}</code>
      </pre>

      <p className=“python-tip-note”>
        Tip: Four spaces per indentation level is the usual convention.
      </p>
    </section>
  )
}
