import { ArrowLeft, ArrowRight } from 'lucide-react'
import './LessonNavigation.css'

type LessonNavigationProps = {
chapterTitle: string
lessonTitle: string
currentLesson: number
totalLessons: number
onPrevious?: () => void
onNext?: () => void
}

export function LessonNavigation({
chapterTitle,
lessonTitle,
currentLesson,
totalLessons,
onPrevious,
onNext,
}: LessonNavigationProps) {
const progress = totalLessons > 0
? Math.min(100, Math.max(0, (currentLesson / totalLessons) * 100))
: 0

return (
<nav className="lesson-navigation" aria-label="Lesson navigation">
<div className="lesson-navigation__heading">
<div>
<span className="lesson-navigation__chapter">{chapterTitle}</span>
<h2>{lessonTitle}</h2>
</div>
<span className="lesson-navigation__count">
Lesson {currentLesson} of {totalLessons}
</span>
</div>

  <div
    className="lesson-navigation__progress"
    role="progressbar"
    aria-label="Position in chapter"
    aria-valuenow={currentLesson}
    aria-valuemin={0}
    aria-valuemax={totalLessons}
  >
    <div style={{ width: `${progress}%` }} />
  </div>

  <div className="lesson-navigation__actions">
    <button
      type="button"
      onClick={onPrevious}
      disabled={!onPrevious || currentLesson <= 1}
    >
      <ArrowLeft size={16} />
      Previous lesson
    </button>

    <button
      type="button"
      className="lesson-navigation__next"
      onClick={onNext}
      disabled={!onNext || currentLesson >= totalLessons}
    >
      Next lesson
      <ArrowRight size={16} />
    </button>
  </div>
</nav>

)
}