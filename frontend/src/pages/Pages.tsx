import { PracticePage } from '../features/practice/PracticePage'
import { LessonsCatalog } from '../features/lessons/LessonsCatalog'
import '../features/dashboard/dashboard.css'
import { PythonTipCard } from '../features/dashboard/PythonTipCard'
import { useEffect, useState } from 'react'
import { authApi } from '../lib/api'
import { StudentGreeting } from '../features/dashboard/StudentGreeting'
import { DailyGoalCard } from '../features/dashboard/DailyGoalCard'

import { Link } from 'react-router-dom'

type PageProps = {
  title: string
  description: string
}

function Page({ title, description }: PageProps) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
      <div className="empty-state">
        <h2>Coming soon</h2>
        <p>This section is under development.</p>
        <Link to="/">Back to dashboard</Link>
      </div>
    </section>
  )
}

export function Dashboard() {
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    let active = true

    authApi.me()
      .then((student) => {
        if (active) setFirstName(student.first_name)
      })
      .catch(() => {})

    return () => { active = false }
  }, [])

  return (
    <section className="page student-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-kicker">PYLEARN / STUDENT DASHBOARD</span>
          <h1>Your Python workspace</h1>
          <p>Learn the concepts, write real code, and build your skills step by step.</p>
        </div>
        <span className="dashboard-heading-icon" aria-hidden="true">{'</>'}</span>
      </div>

      {firstName && <StudentGreeting firstName={firstName} />}

      <div className="dashboard-columns">
        <div className="dashboard-primary">
          <section className="dashboard-course">
            <div className="dashboard-course-top">
              <span className="dashboard-course-label">YOUR LEARNING PATH</span>
              <span className="dashboard-course-level">BEGINNER</span>
            </div>

            <div className="dashboard-course-symbol" aria-hidden="true">Py</div>
            <h2>Python Fundamentals</h2>
            <p>
              Build a strong foundation in Python, from your first line of code
              to functions, collections, and problem-solving.
            </p>

            <div className="dashboard-course-meta">
              <span>8 planned chapters</span>
              <span>Step-by-step lessons</span>
            </div>

            <Link className="dashboard-course-action" to="/lessons">
              Explore learning path <span aria-hidden="true">→</span>
            </Link>
          </section>

          <div className="dashboard-section-title">
            <div>
              <h2>What would you like to do?</h2>
              <p>Choose how you want to learn today.</p>
            </div>
          </div>

          <div className="dashboard-action-grid">
            <Link className="dashboard-action-card" to="/lessons">
              <span className="dashboard-action-icon dashboard-action-icon--blue" aria-hidden="true">01</span>
              <h3>Learn Python</h3>
              <p>Follow a structured path from beginner concepts to practical skills.</p>
              <span className="dashboard-action-link">Browse lessons →</span>
            </Link>

            <Link className="dashboard-action-card" to="/practice">
              <span className="dashboard-action-icon dashboard-action-icon--green" aria-hidden="true">02</span>
              <h3>Coding practice</h3>
              <p>Work through Python challenges and improve your problem-solving.</p>
              <span className="dashboard-action-link">Open practice →</span>
            </Link>
          </div>

          <Link className="dashboard-progress-link" to="/progress">
            <div>
              <strong>My learning progress</strong>
              <p>Track your completed lessons and coding activity when tracking is available.</p>
            </div>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <aside className="dashboard-secondary" aria-label="Learning tools">
          <DailyGoalCard completed={0} target={5} />
          <p className="dashboard-goal-note">
            Goal tracking preview — exercise activity is not connected yet.
          </p>
          <PythonTipCard />
        </aside>
      </div>
    </section>
  )
}

export function Lessons() {
  return <LessonsCatalog />
}

export function Practice() {
  return <PracticePage />
}

export function Progress() {
  return (
    <Page
      title="My Progress"
      description="Track your learning journey and completed exercises."
    />
  )
}

export function Login() {
  return (
    <Page
      title="Sign In"
      description="Student authentication will be available here."
    />
  )
}

export function Register() {
  return (
    <Page
      title="Create Account"
      description="Student registration will be available here."
    />
  )
}

export function NotFound() {
  return (
    <Page
      title="Page Not Found"
      description="The page you requested does not exist."
    />
  )
}
