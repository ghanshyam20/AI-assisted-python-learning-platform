// These types describe the pages created in Django Admin.
export type PageBlock = {
  id: number
  block_type: 'heading' | 'paragraph' | 'bullets' | 'numbered' | 'code' | 'output' | 'tip' | 'note'
  content: string
  position: number
}

export type LessonPage = {
  id: number
  title: string
  position: number
  blocks: PageBlock[]
}

export type Lesson = {
  pages: LessonPage[]
  id: number
  chapter: number
  chapter_title: string
  title: string
  slug: string
  introduction: string
  objectives: string[]
  explanation: string
  example_code: string
  example_explanation: string
  starter_code: string
  tip_title: string
  tip: string
  tip_example: string
  position: number
}

export type Chapter = {
  id: number
  title: string
  description: string
  position: number
  lessons: Lesson[]
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`/api/learning/${path}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Please sign in to access your lessons.')
    }
    if (response.status === 404) {
      throw new Error('The requested lesson was not found.')
    }
    throw new Error(`Unable to load learning content (${response.status}).`)
  }

  return response.json() as Promise<T>
}

export const learningApi = {
  chapters: () => get<Chapter[]>('chapters/'),
  lesson: (slug: string) =>
    get<Lesson>(`lessons/${encodeURIComponent(slug)}/`),
}
