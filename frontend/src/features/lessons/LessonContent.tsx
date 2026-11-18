import './LessonContent.css'

type LessonContentProps = {
  title: string
  introduction: string
  objectives: string[]
  explanation: string
  exampleCode: string
  exampleExplanation: string
}

export function LessonContent({
  title,
  introduction,
  objectives,
  explanation,
  exampleCode,
  exampleExplanation,
}: LessonContentProps) {
  return (
    <article className="lesson-content">
      <header className="lesson-content-header">
        <span className="lesson-content-label">PYTHON LESSON</span>
        <h1>{title}</h1>
        <p>{introduction}</p>
      </header>

      <section className="lesson-content-section">
        <h2>What you will learn</h2>
        <ul>
          {objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>

      <section className="lesson-content-section">
        <h2>Understanding the concept</h2>
        <p>{explanation}</p>
      </section>

      <section className="lesson-content-section">
        <h2>Python example</h2>
        <div className="lesson-code-block">
          <div className="lesson-code-heading">Python</div>
          <pre><code>{exampleCode}</code></pre>
        </div>
        <p>{exampleExplanation}</p>
      </section>
    </article>
  )
}
