import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, authApi } from '../../lib/api'
import type { RegisterData } from '../../lib/api'
import { getPasswordChecks } from './password'
import './auth.css'

const initialForm: RegisterData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterData>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function updateField(field: keyof RegisterData, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError('')

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await authApi.register(form)
      navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully. Please sign in.' },
      })
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.',
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
          <h1>Create your account</h1>
          <p>Start learning Python at your own pace.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-name-row">
            <label>
              First name
              <input
                type="text"
                autoComplete="given-name"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                required
                maxLength={150}
              />
            </label>

            <label>
              Last name
              <input
                type="text"
                autoComplete="family-name"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                required
                maxLength={150}
              />
            </label>
          </div>

          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <span className="auth-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
                minLength={8}
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

          <label>
            Confirm password
            <span className="auth-password-field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirm_password}
                onChange={(e) => updateField('confirm_password', e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                aria-pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {form.password.length > 0 && (
            <div className="auth-password-checks" aria-live="polite">
              <p>Password guidance</p>
              <ul>
                {getPasswordChecks(form.password, form.confirm_password).map(
                  (check) => (
                    <li
                      key={check.label}
                      className={check.passed ? 'is-valid' : 'is-pending'}
                    >
                      <span aria-hidden="true">
                        {check.passed ? '✓' : '○'}
                      </span>
                      {check.label}
                      {!check.required && <small>Recommended</small>}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}
