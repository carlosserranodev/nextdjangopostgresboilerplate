import { create } from "zustand";
import { persist } from "zustand/middleware";
import transactionService from "../services/transactionService";

const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      lastSync: null,

      setTransactions: (transactions) => set({ transactions }),

      syncTransactions: async (accessToken, startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const transactions = await transactionService.syncTransactions(
            accessToken,
            startDate,
            endDate
          );
          set({
            transactions: [...get().transactions, ...transactions],
            lastSync: new Date().toISOString(),
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      addTransaction: async (transaction) => {
        try {
          console.log("Estado antes de añadir:", get().transactions);

          set((state) => ({
            transactions: [...state.transactions, transaction],
            lastSync: new Date().toISOString(),
          }));

          console.log("Estado después de añadir:", get().transactions);
        } catch (error) {
          console.error("Error adding transaction:", error);
        }
      },

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      fetchTransactions: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
          console.log("Fetching transactions...");
          const transactions = await transactionService.getTransactions();
          console.log("Fetched transactions:", transactions);
          set({ transactions, isLoading: false });
        } catch (error) {
          console.error("Error fetching transactions:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      // Getters
      getTransactionsByAccount: (accountId) => {
        const { transactions } = get();
        return transactions.filter((t) => t.accountId === accountId);
      },

      getTransactionsByDateRange: (startDate, endDate) => {
        const { transactions } = get();
        return transactions.filter(
          (t) => t.date >= startDate && t.date <= endDate
        );
      },

      getStats: () => {
        const transactions = get().transactions;

        const totalIncome = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const byCategory = transactions.reduce((acc, t) => {
          if (!acc[t.category]) {
            acc[t.category] = 0;
          }
          acc[t.category] += t.amount;
          return acc;
        }, {});

        return {
          totalIncome,
          totalExpenses,
          byCategory,
        };
      },

      getFilteredTransactions: (filters) => {
        const transactions = get().transactions;

        return transactions.filter((transaction) => {
          // Filtro por fecha
          if (filters.dateRange.startDate && filters.dateRange.endDate) {
            const transactionDate = new Date(transaction.date);
            if (
              transactionDate < filters.dateRange.startDate ||
              transactionDate > filters.dateRange.endDate
            ) {
              return false;
            }
          }

          // Filtro por cuenta
          if (
            filters.accountId &&
            transaction.accountId !== filters.accountId
          ) {
            return false;
          }

          // Filtro por categoría
          if (
            filters.categoryId &&
            transaction.categoryId !== filters.categoryId
          ) {
            return false;
          }

          // Filtro por tipo
          if (filters.type !== "all" && transaction.type !== filters.type) {
            return false;
          }

          // Filtro por texto
          if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            return transaction.description.toLowerCase().includes(searchLower);
          }

          return true;
        });
      },

      // Método para notificar cambios
      notifyUpdate: () => {
        const currentTime = Date.now();
        const lastUpdateTime = get().lastUpdate;

        // Prevenir actualizaciones muy frecuentes
        if (!lastUpdateTime || currentTime - lastUpdateTime > 1000) {
          set({ lastUpdate: currentTime });
        }
      },
    }),
    {
      name: "transactions-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useTransactionStore;
