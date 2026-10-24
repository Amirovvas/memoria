/**
 * Client for the Express API, reached through the `/api` rewrite in next.config.ts.
 * The access token lives only in memory; the refresh token is an httpOnly cookie the browser sends itself.
 */

import type { Gift, Occasion, Opening, PublicGift } from "./gifts"

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

async function send<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(init.headers)
  // strings are JSON; a Blob (an uploaded photo or song) brings its own type
  if (typeof init.body === "string") headers.set("Content-Type", "application/json")
  else if (init.body instanceof Blob) headers.set("Content-Type", init.body.type || "image/jpeg")
  if (auth && accessToken) headers.set("Authorization", `Bearer ${accessToken}`)

  let res: Response
  try {
    res = await fetch(`/api${path}`, { ...init, headers, credentials: "same-origin" })
  } catch {
    throw new ApiError(0, "Нет связи с сервером. Проверьте интернет")
  }
  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    // the dev proxy answers 500 with an HTML page when the API is not running
    const message = data?.message ?? (res.status >= 500 ? "Сервер недоступен, попробуйте позже" : "Что-то пошло не так")
    throw new ApiError(res.status, message)
  }
  return data as T
}

// Refresh tokens are single-use, so parallel callers must share one request instead of racing.
let refreshing: Promise<string | null> | null = null

export function refreshSession() {
  refreshing ??= send<{ accessToken: string }>("/auth/refresh", { method: "POST" })
    .then((r) => r.accessToken)
    .catch((e) => {
      if (e instanceof ApiError && e.status === 401) return null
      throw e
    })
    .then((token) => {
      setAccessToken(token)
      return token
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/** Calls a protected endpoint; on an expired access token refreshes once and retries. */
async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!accessToken) await refreshSession()
  try {
    return await send<T>(path, init, true)
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 401)) throw e
    if (!(await refreshSession())) throw e
    return send<T>(path, init, true)
  }
}

interface AuthResponse {
  user: User
  accessToken: string
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    send<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    send<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => send<void>("/auth/logout", { method: "POST" }),
  profile: () => authed<{ data: User }>("/auth/profile").then((r) => r.data),
  updateProfile: (body: { name?: string; email?: string }) =>
    authed<{ data: User }>("/auth/profile", { method: "PATCH", body: JSON.stringify(body) }).then((r) => r.data),
}

/** A collage as the API stores it; times are epoch milliseconds. */
export interface ServerProject {
  id: string
  name: string
  category: string
  templateId?: string
  doc: unknown
  createdAt: number
  updatedAt: number
  openedAt?: number
  deletedAt?: number
}

export interface ServerPhoto {
  id: string
  url: string
  name: string
}

const json = (body: unknown) => JSON.stringify(body)
const data = <T>(r: { data: T }) => r.data

/** The signed-in user's collages, favourite templates and uploaded photos. */
export const libraryApi = {
  projects: () => authed<{ data: ServerProject[] }>("/projects").then(data),
  createProject: (p: Pick<ServerProject, "id" | "name" | "category" | "templateId" | "doc">) =>
    authed<{ data: ServerProject }>(`/projects/${p.id}`, { method: "PUT", body: json(p) }).then(data),
  updateProject: (id: string, patch: { name?: string; doc?: unknown; openedAt?: number; deletedAt?: number | null }) =>
    authed<{ data: ServerProject }>(`/projects/${id}`, { method: "PATCH", body: json(patch) }).then(data),
  deleteProject: (id: string) => authed<void>(`/projects/${id}`, { method: "DELETE" }),
  emptyTrash: () => authed<void>("/projects", { method: "DELETE" }),

  favorites: () => authed<{ data: string[] }>("/favorites").then(data),
  addFavorite: (templateId: string) => authed<void>(`/favorites/${templateId}`, { method: "PUT" }),
  removeFavorite: (templateId: string) => authed<void>(`/favorites/${templateId}`, { method: "DELETE" }),

  photos: () => authed<{ data: ServerPhoto[] }>("/photos").then(data),
  uploadPhoto: (blob: Blob, name: string) =>
    authed<{ data: ServerPhoto }>(`/photos?name=${encodeURIComponent(name)}`, { method: "POST", body: blob }).then(data),
  deletePhoto: (id: string) => authed<void>(`/photos/${id}`, { method: "DELETE" }),
}

export interface NewGift {
  recipient: string
  occasion: Occasion
  message: string
  signature: string
  finale: string
  animation: Opening
  music: { track: string } | { path: string; title: string } | null
  collages: { path: string; w: number; h: number }[]
}

/** Surprise pages behind a QR code. Opening one needs no account; making one does. */
export const giftsApi = {
  list: () => authed<{ data: Gift[] }>("/gifts").then(data),
  create: (gift: NewGift) => authed<{ data: Gift }>("/gifts", { method: "POST", body: json(gift) }).then(data),
  remove: (id: string) => authed<void>(`/gifts/${id}`, { method: "DELETE" }),
  /** a collage snapshot (image/jpeg) or the user's own song */
  uploadFile: (file: Blob) =>
    authed<{ data: { path: string; url: string } }>("/gifts/files", { method: "POST", body: file }).then(data),
  open: (id: string) => send<{ data: PublicGift }>(`/public/gifts/${id}`).then(data),
}
