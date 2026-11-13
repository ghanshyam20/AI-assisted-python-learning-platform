import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ApiError, authApi } from '../../lib/api'
import type { Student } from '../../lib/api'

type AuthState =
  | { status: 'checking' }
  | { status: 'authenticated'; user: Student }
  | { status: 'unauthenticated' }
  | { status: 'error' }

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [auth, setAuth] = useState<AuthState>({ status: 'checking' })

  useEffect(() => {
    let active = true

    authApi.me()
      .then((user) => {
        if (active) {
          setAuth({ status: 'authenticated', user })
        }
      })
      .catch((error: unknown) => {
        if (!active) return

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          setAuth({ status: 'unauthenticated' })
        } else {
          setAuth({ status: 'error' })
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (auth.status === 'checking') {
    return (
      <main className="auth-page">
        <p role="status">Checking your session...</p>
      </main>
    )
  }

  if (auth.status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (auth.status === 'error') {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Unable to verify your session</h1>
          <p>Please check your connection and refresh the page.</p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
