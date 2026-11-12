import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  to: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Button({
  children,
  to,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  return (
    <Link
      to={to}
      className={`button button--${variant} ${className}`.trim()}
    >
      {children}
    </Link>
  )
}
