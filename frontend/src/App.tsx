import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LogOut,
  BookOpen,
  Code2,
  LayoutDashboard,
  TrendingUp,
} from 'lucide-react'

import { LandingPage } from './features/landing/LandingPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { authApi } from './lib/api'
import {
  Dashboard,
  Lessons,
  Practice,
  Progress,
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
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    if (signingOut) return

    setSigningOut(true)
    setLogoutError('')

    try {
      await authApi.logout()
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Unable to sign out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <ProtectedRoute>
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

        <div className="sidebar-footer">
          {logoutError && (
            <p className="sidebar-error" role="alert">{logoutError}</p>
          )}
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            disabled={signingOut}
          >
            <LogOut size={18} />
            <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
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
