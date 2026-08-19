import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      //Usuario actual
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      //Sala actual
      currentRoom: null,
      setCurrentRoom: (room) => set({ currentRoom: room }),
      //Dark Mode
      darkMode: true,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'movie-together-storage', // clave con la que se guarda en localStorage
    }
  )
)