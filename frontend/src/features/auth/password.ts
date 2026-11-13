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
