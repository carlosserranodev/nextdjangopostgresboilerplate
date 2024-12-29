import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.NEXT_PUBLIC_PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.NEXT_PUBLIC_PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const plaidService = {
  createLinkToken: async (userId) => {
    try {
      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: "Finance Analysis App",
        products: ["auth", "transactions"],
        country_codes: ["ES"],
        language: "es",
      });
      return response.data.link_token;
    } catch (error) {
      console.error("Error creating link token:", error);
      throw error;
    }
  },

  exchangePublicToken: async (publicToken) => {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
      return response.data;
    } catch (error) {
      console.error("Error exchanging public token:", error);
      throw error;
    }
  },

  getAccounts: async (accessToken) => {
    try {
      const response = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      return response.data.accounts;
    } catch (error) {
      console.error("Error getting accounts:", error);
      throw error;
    }
  },
};

export default plaidService;
