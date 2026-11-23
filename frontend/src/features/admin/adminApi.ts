/**
 * Content-management API client.
 *
 * Django sessions authenticate requests, while the backend independently
 * verifies staff permissions for every content-management operation.
 */

const API_BASE = "/api/learning/manage"

export type Chapter = {
  id: number
  title: string
  description: string
  position: number
  published: boolean
}

export type Lesson = {
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
  published: boolean
}

export type LessonPage = {
  id: number
  lesson: number
  lesson_title: string
  title: string
  position: number
  published: boolean
}

export type PageBlock = {
  id: number
  page: number
  block_type:
    | "heading"
    | "paragraph"
    | "bullets"
    | "numbered"
    | "code"
    | "output"
    | "tip"
    | "note"
  content: string
  position: number
}

type Resource = "chapters" | "lessons" | "pages" | "blocks"

function getCookie(name: string): string {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : ""
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase()
  const writesData = !["GET", "HEAD", "OPTIONS"].includes(method)

  if (writesData && !getCookie("csrftoken")) {
    // Django issues the CSRF cookie through the existing auth endpoint.
    const response = await fetch("/api/auth/csrf/", {
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Unable to initialize CSRF protection.")
    }
  }

  const response = await fetch(`${API_BASE}/${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(writesData ? { "X-CSRFToken": getCookie("csrftoken") } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)

    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : `Request failed (${response.status}).`,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function resourceApi<T extends { id: number }>(resource: Resource) {
  return {
    list: () => request<T[]>(`${resource}/`),

    get: (id: number) => request<T>(`${resource}/${id}/`),

    create: (data: Partial<Omit<T, "id">>) =>
      request<T>(`${resource}/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: number, data: Partial<Omit<T, "id">>) =>
      request<T>(`${resource}/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: number) =>
      request<void>(`${resource}/${id}/`, {
        method: "DELETE",
      }),
  }
}

export const adminApi = {
  chapters: resourceApi<Chapter>("chapters"),
  lessons: resourceApi<Lesson>("lessons"),
  pages: resourceApi<LessonPage>("pages"),
  blocks: resourceApi<PageBlock>("blocks"),
}
