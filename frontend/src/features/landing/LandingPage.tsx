import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
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
  const progressRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = progressRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

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

        <div ref={progressRef} className={`progress-preview ${isVisible ? "progress-preview--visible" : ""}`}>
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
      <Container className="about-grid">
        <div className="about-content">
          <span className="eyebrow">WHY PYLEARN EXISTS</span>
          <h2>Learning Python should feel like progress, not guesswork.</h2>
          <p>
            Reading tutorials is a good start. But understanding programming
            comes from writing code, making mistakes, and trying again.
          </p>
          <p>
            PyLearn is a student-developed project bringing beginner lessons,
            coding exercises, automated feedback, and AI-assisted guidance
            into one learning experience.
          </p>
          <div className="about-values">
            <div><CheckCircle2 size={18} /><span>Start with the fundamentals</span></div>
            <div><CheckCircle2 size={18} /><span>Learn through real practice</span></div>
            <div><CheckCircle2 size={18} /><span>See your progress over time</span></div>
          </div>
        </div>

        <div className="about-journey" aria-label="PyLearn learning approach">
          <div className="about-journey-heading">
            <span className="about-journey-icon"><Code2 size={20} /></span>
            <div>
              <strong>Your learning journey</strong>
              <span>One step at a time</span>
            </div>
          </div>
          <div className="about-journey-steps">
            <div><span>01</span><div><strong>Understand</strong><p>Learn a Python concept with clear examples.</p></div></div>
            <div><span>02</span><div><strong>Practice</strong><p>Apply what you learned in the code editor.</p></div></div>
            <div><span>03</span><div><strong>Improve</strong><p>Use feedback and hints to keep moving forward.</p></div></div>
          </div>
          <div className="about-journey-note">
            <Lightbulb size={17} />
            <span>Built around learning by doing.</span>
          </div>
        </div>
      </Container>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="landing-section final-cta">
      <Container>
        <div className="final-cta-panel">
          <span className="final-cta-eyebrow">YOUR PYTHON JOURNEY</span>
          <h2>Your next line of code starts here.</h2>
          <p>
            Build your skills with focused lessons, practical challenges,
            and guidance when you need it.
          </p>
          <Button to="/register" className="final-cta-button">
            Get started <ArrowRight size={18} />
          </Button>
          <span className="final-cta-note">Start with the basics. Grow at your own pace.</span>
        </div>
      </Container>
    </section>
  )
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <Container>
        <div className="footer-main">
          <div className="footer-intro">
            <Link className="footer-brand" to="/">
              <Code2 size={21} />
              <span>PyLearn</span>
            </Link>
            <p>
              A student-developed platform helping beginners
              learn Python through practice.
            </p>
            <div className="footer-socials">
              <a
                className="footer-social-link"
                href="https://github.com/ghanshyam20"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Developer GitHub profile (opens in a new tab)"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.12c-3.09.67-3.74-1.31-3.74-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 2.26 3.21 1.6.1-.72.39-1.21.71-1.49-2.47-.28-5.06-1.24-5.06-5.49 0-1.21.43-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.08 5.48.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
                <span>GitHub</span>
                <ArrowUpRight size={14} />
              </a>

              <a
                className="footer-social-link"
                href="https://www.linkedin.com/in/ghanshyam2026/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Developer LinkedIn profile (opens in a new tab)"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.53 2.8-1.53 2.99 0 3.57 1.97 3.57 4.53v5.25Z" />
                </svg>
                <span>LinkedIn</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          <nav className="footer-column" aria-label="Footer navigation">
            <h3>Explore</h3>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#about">About PyLearn</a>
          </nav>

          <div className="footer-column">
            <h3>Get started</h3>
            <Link to="/register">Create an account</Link>
            <Link to="/login">Sign in</Link>
          </div>

          <div className="footer-column">
            <h3>Project</h3>
            <a
              href="https://github.com/ghanshyam20/AI-assisted-python-learning-platform"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code <ArrowUpRight size={13} />
            </a>
            <a href="#about">Our approach</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} PyLearn. Student-developed project.</span>
          <span>Learn. Practice. Improve.</span>
        </div>
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
