export type PasswordCheck = {
  label: string
  passed: boolean
  required: boolean
}

export function getPasswordChecks(
  password: string,
  confirmation: string,
): PasswordCheck[] {
  return [
    {
      label: 'At least 8 characters',
      passed: password.length >= 8,
      required: true,
    },
    {
      label: 'Contains a letter',
      passed: /[a-zA-Z]/.test(password),
      required: false,
    },
    {
      label: 'Contains a number',
      passed: /[0-9]/.test(password),
      required: false,
    },
    {
      label: 'Passwords match',
      passed: confirmation.length > 0 && password === confirmation,
      required: true,
    },
  ]
}

export function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '' }

  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) || /[^a-zA-Z0-9]/.test(password)) score++

  const level = Math.max(1, score)
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  return {
    score: level,
    label: labels[level - 1],
  }
}
