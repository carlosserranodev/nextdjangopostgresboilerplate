import { create } from "zustand";
import { persist } from "zustand/middleware";
import accountService from "../services/accountService";

const useAccountStore = create(
  persist(
    (set, get) => ({
      accounts: [],
      bankAccounts: [],
      isLoading: false,
      error: null,

      get totalBalance() {
        const manualBalance = get().accounts.reduce(
          (sum, acc) => sum + (parseFloat(acc.balance) || 0),
          0
        );
        const bankBalance = get().bankAccounts.reduce(
          (sum, acc) => sum + (parseFloat(acc.balance) || 0),
          0
        );
        return manualBalance + bankBalance;
      },

      get allAccounts() {
        return [...get().accounts, ...get().bankAccounts];
      },

      fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
          const manualAccounts = await accountService.getAccounts();
          const bankAccounts = await accountService.getBankAccounts();

          set({
            accounts: manualAccounts,
            bankAccounts: bankAccounts,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      addAccount: async (accountData) => {
        set({ isLoading: true, error: null });
        try {
          const newAccount = await accountService.createAccount(accountData);
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateAccount: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAccount = await accountService.updateAccount(
            id,
            updates
          );
          set((state) => ({
            accounts: state.accounts.map((acc) =>
              acc.id === id ? updatedAccount : acc
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      removeAccount: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await accountService.deleteAccount(id);
          set((state) => ({
            accounts: state.accounts.filter((acc) => acc.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "accounts-storage",
    }
  )
);

export default useAccountStore;
