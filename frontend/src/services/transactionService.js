import plaidService from "./plaidService";
import api from "./api";

const transactionService = {
  // Obtener transacciones del backend
  getTransactions: async () => {
    console.log("Intentando obtener transacciones...");
    try {
      const response = await api.get("/api/transactions/");
      console.log("Transacciones obtenidas:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
      throw error;
    }
  },

  // Sincronizar transacciones con Plaid
  syncTransactions: async (accessToken, startDate, endDate) => {
    try {
      const response = await plaidService.plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      });

      return response.data.transactions.map((transaction) => ({
        id: transaction.transaction_id,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.name,
        category: transaction.category[0],
        merchantName: transaction.merchant_name,
        accountId: transaction.account_id,
        pending: transaction.pending,
      }));
    } catch (error) {
      console.error("Error syncing transactions:", error);
      throw error;
    }
  },

  // Crear una nueva transacción
  createTransaction: async (transactionData) => {
    const response = await api.post("/api/transactions/", transactionData);
    console.log("Respuesta del servicio:", response.data);
    return response.data;
  },

  // Actualizar una transacción existente
  updateTransaction: async (id, updates) => {
    const response = await api.put(`/api/transactions/${id}/`, updates);
    return response.data;
  },

  // Eliminar una transacción
  deleteTransaction: async (id) => {
    await api.delete(`/api/transactions/${id}/`);
  },

  // Función para manejar webhooks de Plaid
  handleWebhook: async (webhookType, webhookCode, itemId) => {
    switch (webhookType) {
      case "TRANSACTIONS":
        if (
          webhookCode === "INITIAL_UPDATE" ||
          webhookCode === "DEFAULT_UPDATE"
        ) {
          // Actualizar transacciones
          // En un caso real, esto se manejaría en el backend
        }
        break;
      default:
        console.log("Unhandled webhook type:", webhookType);
    }
  },
};

export default transactionService;
