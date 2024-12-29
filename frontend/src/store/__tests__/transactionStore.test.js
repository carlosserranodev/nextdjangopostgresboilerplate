import { act } from "@testing-library/react";
import useTransactionStore from "../transactionStore";

describe("transactionStore", () => {
  beforeEach(() => {
    useTransactionStore.setState({
      transactions: [],
      filters: {
        startDate: null,
        endDate: null,
        category: null,
      },
    });
  });

  it("adds transactions", () => {
    act(() => {
      useTransactionStore.getState().addTransaction({
        id: 1,
        amount: 100,
        type: "expense",
        category: "Food",
      });
    });

    const state = useTransactionStore.getState();
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].amount).toBe(100);
  });

  it("filters transactions by category", () => {
    act(() => {
      useTransactionStore.setState({
        transactions: [
          { id: 1, category: "Food", amount: 100 },
          { id: 2, category: "Transport", amount: 50 },
        ],
      });
      useTransactionStore.getState().setFilters({ category: "Food" });
    });

    const filtered = useTransactionStore.getState().getFilteredTransactions();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe("Food");
  });

  it("calculates statistics correctly", () => {
    act(() => {
      useTransactionStore.setState({
        transactions: [
          { id: 1, type: "income", amount: 1000, category: "Salary" },
          { id: 2, type: "expense", amount: 500, category: "Food" },
        ],
      });
    });

    const stats = useTransactionStore.getState().getStats();
    expect(stats.totalIncome).toBe(1000);
    expect(stats.totalExpenses).toBe(500);
    expect(stats.byCategory).toEqual({
      Salary: 1000,
      Food: 500,
    });
  });
});
