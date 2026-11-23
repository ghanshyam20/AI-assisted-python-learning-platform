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

type ProtectedRouteProps = {
  children: ReactNode
  // Admin routes require Django staff status in addition to authentication.
  requireStaff?: boolean
}

export function ProtectedRoute({
  children,
  requireStaff = false,
}: ProtectedRouteProps) {
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
        to={requireStaff ? "/admin-login" : "/login"}
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

  // A signed-in student must not enter staff-only application screens.
  // Django must independently enforce permissions on every admin API.
  if (requireStaff && !auth.user.is_staff) {
    // Authenticated students cannot access administrator screens.
    // Show the admin-specific access page rather than student navigation.
    return <Navigate to="/admin-login" replace />
  }

  return <>{children}</>
}
