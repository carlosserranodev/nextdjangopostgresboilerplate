import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAppStore = create(
  persist(
    (set) => ({
      // Estado inicial
      isLoading: false,
      error: null,

      // Acciones
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "app-storage",
    }
  )
);

export default useAppStore;
