export type GeneratedExercise = {
  id: number
  title: string
  instructions: string
  starter_code: string
  topic: string
  difficulty: string
}

export type ExerciseRequest = {
  topic: string
  difficulty: string
  lesson_slug?: string
}

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  return cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('='))
    : null
}

export async function generateExercise(
  data: ExerciseRequest,
): Promise<GeneratedExercise> {
  await fetch('/api/auth/csrf/', {
    credentials: 'include',
  })

  const token = getCookie('csrftoken')

  if (!token) {
    throw new Error('Unable to initialize secure request.')
  }

  const response = await fetch('/api/learning/exercises/generate/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': token,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error: { detail?: string } = await response.json()
    throw new Error(
      error.detail ?? 'Unable to generate an exercise.'
    )
  }

  return response.json() as Promise<GeneratedExercise>
}

export type ExerciseHint = {
  hint_level: number
  hint: string
}

export async function getExerciseHint(
  exerciseId: number,
): Promise<ExerciseHint> {
  await fetch('/api/auth/csrf/', {
    credentials: 'include',
  })

  const token = getCookie('csrftoken')

  if (!token) {
    throw new Error('Unable to initialize secure request.')
  }

  const response = await fetch(
    `/api/learning/exercises/${exerciseId}/hint/`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
    },
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.detail ?? 'Unable to get a hint.')
  }

  return result as ExerciseHint
}
