import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultCategories = [
  { id: "food", name: "Alimentación", icon: "🍽️", type: "expense" },
  { id: "transport", name: "Transporte", icon: "🚗", type: "expense" },
  { id: "housing", name: "Vivienda", icon: "🏠", type: "expense" },
  { id: "entertainment", name: "Ocio", icon: "🎮", type: "expense" },
  { id: "health", name: "Salud", icon: "⚕️", type: "expense" },
  { id: "shopping", name: "Compras", icon: "🛍️", type: "expense" },
  { id: "salary", name: "Salario", icon: "💰", type: "income" },
  { id: "investment", name: "Inversiones", icon: "📈", type: "income" },
  { id: "gifts", name: "Regalos", icon: "🎁", type: "income" },
];

const useCategoryStore = create(
  persist(
    (set, get) => ({
      categories: defaultCategories,

      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: Date.now().toString() },
          ],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        })),

      getCategoryById: (id) => get().categories.find((cat) => cat.id === id),

      getCategoriesByType: (type) =>
        get().categories.filter((cat) => cat.type === type),
    }),
    {
      name: "categories-storage",
    }
  )
);

export default useCategoryStore;
