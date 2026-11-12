
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
  return (
    <section className="page">
      <div className="welcome">
        <span className="eyebrow">YOUR LEARNING SPACE</span>
        <h1>Learn Python, one step at a time.</h1>
        <p>
          Practice coding, build your skills, and follow your progress
          as you learn.
        </p>
        <Link className="primary-button" to="/practice">
          Start practicing
        </Link>
      </div>

      <div className="section-heading">
        <h2>Explore your learning space</h2>
        <p>Choose where you want to begin.</p>
      </div>

      <div className="feature-grid">
        <Link className="feature-card" to="/lessons">
          <span className="feature-number">01</span>
          <h3>Python lessons</h3>
          <p>Build a strong foundation with beginner-friendly lessons.</p>
          <span className="card-link">Explore lessons →</span>
        </Link>

        <Link className="feature-card" to="/practice">
          <span className="feature-number">02</span>
          <h3>Coding practice</h3>
          <p>Write Python code and work through programming exercises.</p>
          <span className="card-link">Explore practice →</span>
        </Link>

        <Link className="feature-card" to="/progress">
          <span className="feature-number">03</span>
          <h3>My progress</h3>
          <p>Review your learning activity and completed exercises.</p>
          <span className="card-link">View progress →</span>
        </Link>
      </div>
    </section>
  )
}

export function Lessons() {
  return (
    <Page
      title="Python Lessons"
      description="Learn Python concepts through structured lessons."
    />
  )
}

export function Practice() {
  return (
    <Page
      title="Coding Practice"
      description="Improve your Python skills by solving exercises."
    />
  )
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
