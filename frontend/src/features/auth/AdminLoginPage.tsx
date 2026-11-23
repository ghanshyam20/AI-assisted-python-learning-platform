import { useEffect, useState, type FormEvent } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, authApi, type LoginData } from '../../lib/api'
import './auth.css'

export function AdminLoginPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<LoginData>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')

  // An already-authenticated administrator should not need to log in again.
  // Ordinary students remain on the admin login page without gaining access.
  useEffect(() => {
    let active = true

    authApi.me()
      .then((user) => {
        if (active && user.is_staff) {
          navigate('/admin-dashboard', { replace: true })
        }
      })
      .catch(() => {
        // No existing session: show the administrator login form.
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    setError('')
    setLoading(true)

    try {
      await authApi.login({
        email: form.email.trim(),
        password: form.password,
      })

      // Authentication alone is insufficient: confirm the staff role
      // using Django's authoritative current-user endpoint.
      const user = await authApi.me()

      if (!user.is_staff) {
        // Revoke the newly created student session so this admin login
        // cannot silently leave the browser signed in as a student.
        try {
          await authApi.logout()
        } catch {
          // The server still denies non-staff management API requests.
        }

        setError('Administrator access required. This account is not authorized.')
        return
      }

      navigate('/admin-dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'Invalid email or password.'
          : err instanceof Error
            ? err.message
            : 'Unable to sign in. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" to="/">PyLearn</Link>

        <div className="auth-heading">
          <h1>Administrator Login</h1>
          <p>Sign in to manage Python lessons and learning content.</p>
        </div>

        <div className="admin-login-notice">
          <ShieldCheck size={18} />
          <span>Authorized administrators only</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Admin email address
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              disabled={loading || checkingSession}
              required
            />
          </label>

          <label>
            Password
            <span className="auth-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                disabled={loading || checkingSession}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading || checkingSession}
          >
            {checkingSession
              ? 'Checking session...'
              : loading
                ? 'Signing in...'
                : 'Sign in as Administrator'}
          </button>
        </form>

        <p className="auth-footer">
          Student account? <Link to="/login">Student login</Link>
        </p>
      </section>
    </main>
  )
}
