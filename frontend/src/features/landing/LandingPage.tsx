import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Flame,
  Lightbulb,
  Menu,
  Target,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'

const features = [
  {
    icon: BookOpen,
    title: 'Structured Python lessons',
    description:
      'Build a foundation with short explanations, practical examples, and beginner-friendly topics.',
  },
  {
    icon: Code2,
    title: 'Practice in your browser',
    description:
      'Write Python solutions in a dedicated editor and check your code against automated tests.',
  },
  {
    icon: Lightbulb,
    title: 'AI guidance when you need it',
    description:
      'Get contextual hints that help you understand mistakes without immediately revealing the answer.',
  },
  {
    icon: TrendingUp,
    title: 'Track your learning progress',
    description:
      'Follow completed exercises, daily practice goals, XP, and learning streaks as you improve.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Learn the concept',
    description: 'Start with a focused Python lesson and a clear example.',
  },
  {
    number: '02',
    title: 'Solve a challenge',
    description: 'Write Python code directly in the practice workspace.',
  },
  {
    number: '03',
    title: 'Check your solution',
    description: 'Run your code and review the results of automated tests.',
  },
  {
    number: '04',
    title: 'Improve with guidance',
    description: 'Use AI hints when needed, fix mistakes, and try again.',
  },
]

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="public-header">
      <Container className="header-inner">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">
            <Code2 size={20} strokeWidth={2.4} />
          </span>
          <span>PyLearn</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          id="public-navigation"
          className={`public-nav ${menuOpen ? 'public-nav--open' : ''}`}
          aria-label="Public navigation"
        >
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a href="#features" onClick={closeMenu}>
            Features
          </a>
          <a href="#about" onClick={closeMenu}>
            About
          </a>

          <div className="nav-actions">
            <Link to="/login" onClick={closeMenu}>
              Sign in
            </Link>
            <Button to="/register" className="nav-register">
              Get started
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  )
}

function CodePreview() {
  return (
    <div className="workspace-preview" aria-label="Illustrative Python coding workspace">
      <div className="workspace-topbar">
        <div className="workspace-file">
          <Code2 size={16} />
          <span>practice / greeting.py</span>
        </div>
        <span className="workspace-demo-label">DEMO PREVIEW</span>
      </div>

      <div className="workspace-task">
        <div className="workspace-task-heading">
          <span className="workspace-task-category">PYTHON BASICS</span>
          <span className="workspace-difficulty">Beginner</span>
        </div>
        <h3>Write your first function</h3>
        <p>Create a function that returns a greeting using the given name.</p>
      </div>

      <div className="workspace-editor">
        <div className="workspace-editor-label">
          <span><Code2 size={14} /> greeting.py</span>
          <span>Python 3</span>
        </div>
        <div className="workspace-code">
          <span className="workspace-line-numbers" aria-hidden="true">1<br />2<br />3<br />4<br />5</span>
          <pre><code>{`def greet(name):
    return f"Hello, {name}"

print(greet("Alex"))`}</code></pre>
        </div>
      </div>

      <div className="workspace-actions" aria-label="Illustrative editor controls">
        <span className="workspace-run">Run code</span>
        <span className="workspace-submit">Submit solution</span>
      </div>

      <div className="workspace-feedback">
        <div className="workspace-feedback-heading">
          <CheckCircle2 size={16} />
          <strong>Sample result · 2 tests passed</strong>
        </div>
        <code>Output: Hello, Alex</code>
      </div>

      <div className="workspace-hint">
        <Lightbulb size={16} />
        <span>AI hints help you move forward without revealing the full answer.</span>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero">
      <Container className="hero-grid">
        <div className="hero-content">
          <span className="eyebrow">PYTHON LEARNING PLATFORM</span>
          <h1>Learn Python. Practice with purpose.</h1>
          <p>
            Go beyond watching tutorials. Learn Python concepts,
            solve coding challenges, and improve with test feedback
            and AI-powered hints when you need them.
          </p>

          <div className="hero-actions">
            <Button to="/register">
              Start learning <ArrowRight size={18} />
            </Button>
            <a className="button button--secondary" href="#how-it-works">
              How it works
            </a>
          </div>

          <p className="hero-note">
            Start with the basics. Practice at your own pace.
          </p>
        </div>

        <CodePreview />
      </Container>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section">
      <Container>
        <div className="section-intro">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>From learning to doing.</h2>
          <p>
            Follow a simple learning process that helps you turn
            Python concepts into practical skills.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="landing-section section-muted">
      <Container>
        <div className="section-intro">
          <span className="eyebrow">THE LEARNING EXPERIENCE</span>
          <h2>Everything you need to keep practicing.</h2>
          <p>
            Lessons, exercises, and feedback in one learning space.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="landing-feature" key={title}>
              <div className="feature-icon">
                <Icon size={21} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Motivation() {
  return (
    <section className="landing-section">
      <Container className="motivation-grid">
        <div className="motivation-copy">
          <span className="eyebrow">YOUR PROGRESS</span>
          <h2>Small steps add up.</h2>
          <p>
            Set daily practice goals, earn experience points,
            and build a consistent learning habit.
          </p>
          <p>
            Track your achievements as you complete exercises
            and develop your Python skills.
          </p>
        </div>

        <div className="progress-preview">
          <div className="progress-preview-header">
            <div>
              <h3>Learning progress</h3>
              <span>Example student activity</span>
            </div>
            <span className="level-label">Level 3</span>
          </div>

          <div className="progress-stats">
            <div>
              <Zap size={19} />
              <strong>240</strong>
              <span>Total XP</span>
            </div>
            <div>
              <Flame size={19} />
              <strong>5 days</strong>
              <span>Practice streak</span>
            </div>
            <div>
              <Target size={19} />
              <strong>2 / 3</strong>
              <span>Daily goal</span>
            </div>
          </div>

          <div className="progress-label">
            <span>Progress to Level 4</span>
            <span>60%</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Example level progress"
            aria-valuenow={60}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" />
          </div>
        </div>
      </Container>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="landing-section section-muted">
      <Container className="about-content">
        <span className="eyebrow">ABOUT PYLEARN</span>
        <h2>Built for people starting with Python.</h2>
        <p>
          PyLearn is a student-developed learning platform designed
          to help beginners understand programming through regular
          coding practice.
        </p>
        <p>
          The project brings lessons, practical exercises,
          and learning feedback into one place, so students
          can focus on improving their skills step by step.
        </p>
      </Container>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="landing-section final-cta">
      <Container className="final-cta-inner">
        <h2>Ready to start coding?</h2>
        <p>
          Create an account and begin with your first Python lesson.
        </p>
        <Button to="/register">
          Create an account <ArrowRight size={18} />
        </Button>
      </Container>
    </section>
  )
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <Container className="footer-inner">
        <div>
          <Link className="footer-brand" to="/">
            <Code2 size={19} />
            PyLearn
          </Link>
          <p>Learn Python through practice.</p>
        </div>

        <div className="footer-links">
          <a href="#about">About</a>
        </div>

        <span className="footer-copy">
          © {new Date().getFullYear()} PyLearn
        </span>
      </Container>
    </footer>
  )
}

export function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <Features />
        <Motivation />
        <About />
        <FinalCTA />
      </main>
      <PublicFooter />
    </>
  )
}
