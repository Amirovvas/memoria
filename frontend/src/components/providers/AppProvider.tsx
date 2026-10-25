"use client"

import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useUser } from "@/src/hooks/useUser"
import { libraryApi, type ServerPhoto, type ServerProject } from "@/src/lib/api"
import { uid } from "@/src/lib/collage/build"
import type { CollageDoc } from "@/src/lib/collage/types"
import { TEMPLATE_BY_ID, TEMPLATES, templateDoc } from "@/src/lib/catalog"
import { fileToJpeg, isImageFile, makeDemoPhotos } from "@/src/lib/image"
import { LOCAL_PHOTOS } from "@/src/lib/photos"

export type Theme = "light" | "dark"

export interface Project {
  id: string
  name: string
  category: string
  templateId?: string
  doc: CollageDoc
  createdAt: number
  updatedAt: number
  openedAt?: number
  deletedAt?: number
}

export interface Upload {
  id: string
  src: string
  name: string
}

export interface Toast {
  id: string
  message: string
  tone: "default" | "success" | "error"
}

export interface Settings {
  autosave: boolean
  defaultFormat: "png" | "jpg" | "pdf"
  showGuides: boolean
}

/** Interface preferences only; collages, favourites and photos live on the server. */
interface Prefs {
  sidebarCollapsed: boolean
  settings: Settings
}

interface AppState extends Prefs {
  /** true once the signed-in user's library has loaded */
  ready: boolean
  theme: Theme
  setTheme: (t: Theme) => void
  setSidebarCollapsed: (v: boolean) => void
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  activeProjects: Project[]
  trashedProjects: Project[]
  getProject: (id: string) => Project | undefined
  createFromTemplate: (templateId: string) => string
  saveProject: (id: string, patch: Partial<Pick<Project, "doc" | "name">>) => boolean
  renameProject: (id: string, name: string) => void
  duplicateProject: (id: string) => void
  trashProject: (id: string) => void
  restoreProject: (id: string) => void
  deleteProject: (id: string) => void
  emptyTrash: () => void
  touchProject: (id: string) => void
  uploads: Upload[]
  addFiles: (files: FileList | File[]) => Promise<Upload[]>
  addDemoPhotos: (count?: number) => Promise<Upload[]>
  removeUpload: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  toasts: Toast[]
  toast: (message: string, tone?: Toast["tone"]) => void
  dismissToast: (id: string) => void
}

const PREFS_KEY = "memoria:prefs"
// projects and photos used to be kept in the browser under this key
const LEGACY_KEY = "memoria:v2"
const THEME_KEY = "memoria:theme"

const DEFAULT_SETTINGS: Settings = { autosave: true, defaultFormat: "png", showGuides: true }
const DEFAULT_PREFS: Prefs = { sidebarCollapsed: false, settings: DEFAULT_SETTINGS }

const toUpload = (p: ServerPhoto): Upload => ({ id: p.id, src: p.url, name: p.name })

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const { data: user } = useUser()
  const userId = user?.id

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [theme, setThemeState] = useState<Theme>("light")
  const [toasts, setToasts] = useState<Toast[]>([])

  // keyed by user, so a different account on the same browser never sees the previous one's cache
  const keys = useMemo(
    () => ({
      projects: ["library", userId, "projects"] as QueryKey,
      favorites: ["library", userId, "favorites"] as QueryKey,
      photos: ["library", userId, "photos"] as QueryKey,
    }),
    [userId],
  )
  const projectsQ = useQuery({
    queryKey: keys.projects,
    queryFn: () => libraryApi.projects() as Promise<Project[]>,
    enabled: !!userId,
    staleTime: Infinity,
  })
  const favoritesQ = useQuery({ queryKey: keys.favorites, queryFn: libraryApi.favorites, enabled: !!userId, staleTime: Infinity })
  const photosQ = useQuery({
    queryKey: keys.photos,
    queryFn: () => libraryApi.photos().then((ps) => ps.map(toUpload)),
    enabled: !!userId,
    staleTime: Infinity,
  })

  useEffect(() => {
    // Hydrate from the browser once; the inline script in <head> already applied the theme before paint.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      localStorage.removeItem(LEGACY_KEY)
      const raw = localStorage.getItem(PREFS_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Prefs>
        setPrefs({ sidebarCollapsed: !!saved.sidebarCollapsed, settings: { ...DEFAULT_SETTINGS, ...saved.settings } })
      }
    } catch {}
    setThemeState(document.documentElement.dataset.theme === "dark" ? "dark" : "light")
    setPrefsLoaded(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  useEffect(() => {
    if (!prefsLoaded) return
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {}
  }, [prefs, prefsLoaded])

  const toast = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = uid()
    setToasts((t) => [...t.slice(-2), { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    document.documentElement.dataset.theme = t
    try {
      localStorage.setItem(THEME_KEY, t)
    } catch {}
  }, [])

  /*
   * Changes show up at once (written into the query cache) and are sent to the API in the background.
   * Requests for one project go out one after another, so an edit never overtakes the create it follows.
   * If one fails, the cache is reloaded from the server so the screen does not show what was not saved.
   */
  const queues = useRef(new Map<string, Promise<unknown>>())
  const send = useCallback(
    (key: QueryKey, request: () => Promise<unknown>, lane?: string) => {
      const run = () =>
        request().catch((e: unknown) => {
          toast(e instanceof Error ? e.message : "Не удалось сохранить изменения", "error")
          qc.invalidateQueries({ queryKey: key })
        })
      if (!lane) return void run()
      const next = (queues.current.get(lane) ?? Promise.resolve()).then(run)
      queues.current.set(lane, next)
    },
    [qc, toast],
  )
  const setProjects = useCallback(
    (fn: (ps: Project[]) => Project[]) => qc.setQueryData<Project[]>(keys.projects, (ps = []) => fn(ps)),
    [qc, keys.projects],
  )
  const patchProject = useCallback(
    (id: string, local: (p: Project) => Project, remote: Parameters<typeof libraryApi.updateProject>[1]) => {
      setProjects((ps) => ps.map((p) => (p.id === id ? local(p) : p)))
      send(keys.projects, () => libraryApi.updateProject(id, remote), id)
    },
    [setProjects, send, keys.projects],
  )

  const upload = useCallback(
    async (items: { blob: Blob; name: string }[]) => {
      const added: Upload[] = []
      for (const it of items) {
        try {
          added.push(toUpload(await libraryApi.uploadPhoto(it.blob, it.name)))
        } catch (e) {
          toast(e instanceof Error ? e.message : `Не удалось загрузить ${it.name}`, "error")
        }
      }
      if (added.length) {
        qc.setQueryData<Upload[]>(keys.photos, (u = []) => [...added, ...u])
        toast(`Загружено фото: ${added.length}`, "success")
      }
      return added
    },
    [qc, keys.photos, toast],
  )

  const value = useMemo<AppState>(() => {
    const projects = projectsQ.data ?? []
    const favorites = favoritesQ.data ?? []
    const activeProjects = projects.filter((p) => !p.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt)
    const trashedProjects = projects.filter((p) => p.deletedAt).sort((a, b) => b.deletedAt! - a.deletedAt!)
    const create = (project: Project) => {
      setProjects((ps) => [project, ...ps])
      const { id, name, category, templateId, doc } = project
      send(keys.projects, () => libraryApi.createProject({ id, name, category, templateId, doc }) as Promise<ServerProject>, id)
    }

    return {
      ...prefs,
      ready: !!userId && projectsQ.isSuccess && favoritesQ.isSuccess,
      theme,
      setTheme,
      setSidebarCollapsed: (v) => setPrefs((p) => ({ ...p, sidebarCollapsed: v })),
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        const on = favorites.includes(id)
        qc.setQueryData<string[]>(keys.favorites, (f = []) => (on ? f.filter((x) => x !== id) : [id, ...f]))
        send(keys.favorites, () => (on ? libraryApi.removeFavorite(id) : libraryApi.addFavorite(id)))
        toast(on ? "Удалено из избранного" : "Добавлено в избранное", on ? "default" : "success")
      },
      activeProjects,
      trashedProjects,
      getProject: (id) => projects.find((p) => p.id === id),
      createFromTemplate: (templateId) => {
        const t = TEMPLATE_BY_ID[templateId] ?? TEMPLATES[0]
        const now = Date.now()
        const id = `p-${uid()}`
        create({
          id,
          name: t.title,
          category: t.category,
          templateId,
          doc: structuredClone(templateDoc(t)),
          createdAt: now,
          updatedAt: now,
          openedAt: now,
        })
        return id
      },
      saveProject: (id, p) => {
        patchProject(id, (proj) => ({ ...proj, ...p, updatedAt: Date.now() }), p)
        return true
      },
      renameProject: (id, name) => {
        const clean = name.trim()
        if (!clean) return
        patchProject(id, (p) => ({ ...p, name: clean, updatedAt: Date.now() }), { name: clean })
      },
      duplicateProject: (id) => {
        const src = projects.find((p) => p.id === id)
        if (!src) return
        const now = Date.now()
        create({ ...structuredClone(src), id: `p-${uid()}`, name: `${src.name} (копия)`, createdAt: now, updatedAt: now, deletedAt: undefined })
        toast("Проект продублирован", "success")
      },
      trashProject: (id) => {
        const now = Date.now()
        patchProject(id, (p) => ({ ...p, deletedAt: now }), { deletedAt: now })
        toast("Проект перемещён в корзину")
      },
      restoreProject: (id) => {
        patchProject(id, (p) => ({ ...p, deletedAt: undefined }), { deletedAt: null })
        toast("Проект восстановлен", "success")
      },
      deleteProject: (id) => {
        setProjects((ps) => ps.filter((p) => p.id !== id))
        send(keys.projects, () => libraryApi.deleteProject(id), id)
        toast("Проект удалён навсегда")
      },
      emptyTrash: () => {
        setProjects((ps) => ps.filter((p) => !p.deletedAt))
        send(keys.projects, () => libraryApi.emptyTrash())
        toast("Корзина очищена")
      },
      touchProject: (id) => {
        const now = Date.now()
        patchProject(id, (p) => ({ ...p, openedAt: now }), { openedAt: now })
      },
      uploads: photosQ.data ?? [],
      addFiles: async (files) => {
        const list = Array.from(files).filter(isImageFile)
        if (!list.length) {
          toast("Выберите изображения в формате JPG, PNG или WEBP", "error")
          return []
        }
        const items: { blob: Blob; name: string }[] = []
        for (const f of list) {
          try {
            items.push({ blob: await fileToJpeg(f), name: f.name })
          } catch {
            toast(`Не удалось прочитать ${f.name}`, "error")
          }
        }
        return upload(items)
      },
      addDemoPhotos: async (count = 8) => {
        try {
          return await upload(await makeDemoPhotos(LOCAL_PHOTOS, count))
        } catch {
          toast("Не удалось загрузить демо-фото", "error")
          return []
        }
      },
      removeUpload: (id) => {
        qc.setQueryData<Upload[]>(keys.photos, (u = []) => u.filter((x) => x.id !== id))
        send(keys.photos, () => libraryApi.deletePhoto(id))
      },
      updateSettings: (p) => setPrefs((s) => ({ ...s, settings: { ...s.settings, ...p } })),
      toasts,
      toast,
      dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    }
  }, [prefs, userId, projectsQ.data, projectsQ.isSuccess, favoritesQ.data, favoritesQ.isSuccess, photosQ.data, theme, setTheme, qc, keys, send, setProjects, patchProject, upload, toast, toasts])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>")
  return ctx
}

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(!t){t="light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`
