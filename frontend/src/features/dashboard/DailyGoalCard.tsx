type DailyGoalCardProps = {
completed: number
target: number
}

export function DailyGoalCard({ completed, target }: DailyGoalCardProps) {
const safeTarget = Math.max(1, target)
const progress = Math.min(100, Math.max(0, (completed / safeTarget) * 100))
const remaining = Math.max(0, target - completed)

return (
<section className="daily-goal-card">
<h2>Daily Learning Goal</h2>
<p>Complete {target} Python exercises today.</p>

  <p>
    <strong>{completed} / {target}</strong> exercises completed
  </p>

  <progress
    value={progress}
    max={100}
    aria-label="Daily learning goal progress"
  />

  <p>
    {remaining === 0
      ? 'Great work! You reached your daily goal.'
      : `${remaining} more exercise${remaining === 1 ? '' : 's'} to reach your goal!`}
  </p>
</section>

)
}

