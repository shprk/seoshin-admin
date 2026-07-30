import { create } from 'zustand'

interface SessionState {
  expired: boolean
  redirect: string
  openExpired: (redirect: string) => void
  closeExpired: () => void
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  expired: false,
  redirect: '/',
  openExpired: (redirect) => {
    if (get().expired) return
    set({ expired: true, redirect })
  },
  closeExpired: () => set({ expired: false, redirect: '/' }),
}))
