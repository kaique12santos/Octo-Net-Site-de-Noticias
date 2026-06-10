import { create } from 'zustand'

export const useStore = create((set) => ({
  noticiasLidas: 0,
  lerNoticia: () => set((state) => ({ noticiasLidas: state.noticiasLidas + 1 })),
}))