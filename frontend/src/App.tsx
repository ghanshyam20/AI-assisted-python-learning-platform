
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { BookOpen, Code2, LayoutDashboard, TrendingUp } from 'lucide-react'
import './App.css'

const navigation = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/lessons', label: 'Lessons', icon: BookOpen },
  { path: '/practice', label: 'Practice', icon: Code2 },
  { path: '/progress', label: 'My Progress', icon: TrendingUp },
]

function Dashboard() {
  return (
    <section>
      <h1>Welcome to PyLearn</h1>
      <p>Learn Python, practice coding, and track your progress.</p>
      <h2>Start your learning journey</h2>
      <p>Choose Lessons or Practice from the navigation.</p>
    </section>
  )
}

function Page({ title }: { title: string }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>This section is under development.</p>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <h2>PyLearn</h2>
          <nav aria-label="Main navigation">
            {navigation.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path} end={path === '/'}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lessons" element={<Page title="Python Lessons" />} />
            <Route path="/practice" element={<Page title="Coding Practice" />} />
            <Route path="/progress" element={<Page title="My Progress" />} />
            <Route path="*" element={<Page title="Page Not Found" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
