import api from "./api";

const accountService = {
  getAccounts: async () => {
    // Obtener cuentas manuales
    const manualAccounts = await api.get("/api/accounts/");
    // Obtener cuentas bancarias
    const bankAccounts = await api.get("/api/bank-accounts/");

    // Combinar ambos resultados
    return [...manualAccounts.data, ...bankAccounts.data];
  },

  createAccount: async (accountData) => {
    const response = await api.post("/api/accounts/", accountData);
    return response.data;
  },

  updateAccount: async (id, updates) => {
    const response = await api.put(`/api/accounts/${id}/`, updates);
    return response.data;
  },

  deleteAccount: async (id) => {
    await api.delete(`/api/accounts/${id}/`);
  },

  // Métodos específicos para cuentas bancarias
  getBankAccounts: async () => {
    const response = await api.get("/api/bank-accounts/");
    return response.data;
  },
};

export default accountService;
