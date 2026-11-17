type LessonExerciseCardProps = {
  title: string
  description: string
  starterCode: string
}

export function LessonExerciseCard({
  title,
  description,
  starterCode,
}: LessonExerciseCardProps) {
  return (
    <section className=“lesson-exercise-card”>
      <div className=“lesson-exercise-card__header”>
        <span>CODING EXERCISE</span>
        <h2>{title}</h2>
      </div>

      <p>{description}</p>

      <div className=“lesson-exercise-card__editor”>
        <span>Starter code</span>
        <pre><code>{starterCode}</code></pre>
      </div>

      <p className=“lesson-exercise-card__note”>
        Code execution and automatic checking will be added soon.
      </p>
    </section>
  )
}
