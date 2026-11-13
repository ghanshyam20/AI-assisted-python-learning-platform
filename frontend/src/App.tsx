import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react'

import { LandingPage } from './features/landing/LandingPage'
import { RegisterPage } from './features/auth/RegisterPage'
import {
  Dashboard,
  Lessons,
  Practice,
  Progress,
  Login,
  NotFound,
} from './pages/Pages'

import './App.css'

const studentNavigation = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/lessons', label: 'Lessons', icon: BookOpen },
  { path: '/practice', label: 'Practice', icon: Code2 },
  { path: '/progress', label: 'My Progress', icon: TrendingUp },
]

function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>PyLearn</h2>
        <nav aria-label="Student navigation">
          {studentNavigation.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={<StudentLayout><Dashboard /></StudentLayout>}
        />
        <Route
          path="/lessons"
          element={<StudentLayout><Lessons /></StudentLayout>}
        />
        <Route
          path="/practice"
          element={<StudentLayout><Practice /></StudentLayout>}
        />
        <Route
          path="/progress"
          element={<StudentLayout><Progress /></StudentLayout>}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
