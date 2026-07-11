import {
  createAccount,
  updateAccount,
  deleteAccount,
  toggleAccountActive,
  getAccounts,
  getAccount,
  getDashboardStats,
} from "@/services/account";
import * as accountsRepo from "@/repositories/accounts";
import * as paymentsRepo from "@/repositories/payments";

vi.mock("@/repositories/accounts");
vi.mock("@/repositories/payments");

const mockAccountsRepo = vi.mocked(accountsRepo);
const mockPaymentsRepo = vi.mocked(paymentsRepo);

const mockAccount = {
  id: "acc-1",
  name: "Netflix",
  type: "recurring" as const,
  dueDay: 15,
  reminderDays: 3,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createAccount", () => {
  it("creates account with valid input", async () => {
    mockAccountsRepo.insertAccount.mockResolvedValue(mockAccount);

    const result = await createAccount({
      name: "Netflix",
      type: "recurring",
      dueDay: 15,
      reminderDays: 3,
    });

    expect(result).toEqual({ data: mockAccount });
    expect(mockAccountsRepo.insertAccount).toHaveBeenCalledWith({
      name: "Netflix",
      type: "recurring",
      dueDay: 15,
      reminderDays: 3,
    });
  });

  it("trims whitespace from name", async () => {
    mockAccountsRepo.insertAccount.mockResolvedValue(mockAccount);

    await createAccount({
      name: "  Netflix  ",
      type: "recurring",
      dueDay: 15,
      reminderDays: 3,
    });

    expect(mockAccountsRepo.insertAccount).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Netflix" })
    );
  });

  it("defaults reminderDays to 3 when undefined", async () => {
    mockAccountsRepo.insertAccount.mockResolvedValue(mockAccount);

    await createAccount({
      name: "Netflix",
      type: "recurring",
      dueDay: 15,
      reminderDays: undefined,
    });

    expect(mockAccountsRepo.insertAccount).toHaveBeenCalledWith(
      expect.objectContaining({ reminderDays: 3 })
    );
  });

  it("returns error for invalid input", async () => {
    const result = await createAccount({
      name: "",
      type: "recurring",
      dueDay: 15,
      reminderDays: 3,
    });

    expect(result).toHaveProperty("error");
    expect(mockAccountsRepo.insertAccount).not.toHaveBeenCalled();
  });

  it("returns error for invalid dueDay", async () => {
    const result = await createAccount({
      name: "Netflix",
      type: "recurring",
      dueDay: 32,
      reminderDays: 3,
    });

    expect(result).toHaveProperty("error");
  });
});

describe("updateAccount", () => {
  it("updates account with valid input", async () => {
    const updated = { ...mockAccount, name: "Updated" };
    mockAccountsRepo.updateAccount.mockResolvedValue(updated);

    const result = await updateAccount({
      id: "acc-1",
      name: "Updated",
    });

    expect(result).toEqual({ data: updated });
    expect(mockAccountsRepo.updateAccount).toHaveBeenCalledWith(
      "acc-1",
      expect.objectContaining({ name: "Updated" })
    );
  });

  it("trims whitespace on name update", async () => {
    mockAccountsRepo.updateAccount.mockResolvedValue(mockAccount);

    await updateAccount({
      id: "acc-1",
      name: "  Updated  ",
    });

    expect(mockAccountsRepo.updateAccount).toHaveBeenCalledWith(
      "acc-1",
      expect.objectContaining({ name: "Updated" })
    );
  });

  it("returns error when account not found", async () => {
    mockAccountsRepo.updateAccount.mockResolvedValue(null as never);

    const result = await updateAccount({
      id: "nonexistent",
      name: "Updated",
    });

    expect(result).toEqual({ error: "Account not found" });
  });

  it("returns error for invalid input", async () => {
    const result = await updateAccount({
      id: "acc-1",
      dueDay: 99,
    });

    expect(result).toHaveProperty("error");
    expect(mockAccountsRepo.updateAccount).not.toHaveBeenCalled();
  });
});

describe("deleteAccount", () => {
  it("deletes existing account", async () => {
    mockAccountsRepo.deleteAccount.mockResolvedValue(mockAccount);

    const result = await deleteAccount("acc-1");

    expect(result).toEqual({ data: mockAccount });
  });

  it("returns error when account not found", async () => {
    mockAccountsRepo.deleteAccount.mockResolvedValue(null as never);

    const result = await deleteAccount("nonexistent");

    expect(result).toEqual({ error: "Account not found" });
  });
});

describe("toggleAccountActive", () => {
  it("toggles active to inactive", async () => {
    mockAccountsRepo.findAccountById.mockResolvedValue(mockAccount);
    const inactive = { ...mockAccount, isActive: false };
    mockAccountsRepo.updateAccount.mockResolvedValue(inactive);

    const result = await toggleAccountActive("acc-1");

    expect(result).toEqual({ data: inactive });
    expect(mockAccountsRepo.updateAccount).toHaveBeenCalledWith("acc-1", {
      isActive: false,
    });
  });

  it("toggles inactive to active", async () => {
    const inactive = { ...mockAccount, isActive: false };
    mockAccountsRepo.findAccountById.mockResolvedValue(inactive);
    mockAccountsRepo.updateAccount.mockResolvedValue(mockAccount);

    const result = await toggleAccountActive("acc-1");

    expect(result).toEqual({ data: mockAccount });
    expect(mockAccountsRepo.updateAccount).toHaveBeenCalledWith("acc-1", {
      isActive: true,
    });
  });

  it("returns error when account not found", async () => {
    mockAccountsRepo.findAccountById.mockResolvedValue(null as never);

    const result = await toggleAccountActive("nonexistent");

    expect(result).toEqual({ error: "Account not found" });
  });
});

describe("getAccounts", () => {
  it("returns all accounts", async () => {
    mockAccountsRepo.findAllAccounts.mockResolvedValue([mockAccount]);

    const result = await getAccounts();

    expect(result).toEqual([mockAccount]);
  });
});

describe("getAccount", () => {
  it("returns account by id", async () => {
    mockAccountsRepo.findAccountById.mockResolvedValue(mockAccount);

    const result = await getAccount("acc-1");

    expect(result).toEqual(mockAccount);
  });

  it("returns null when not found", async () => {
    mockAccountsRepo.findAccountById.mockResolvedValue(null as never);

    const result = await getAccount("nonexistent");

    expect(result).toBeNull();
  });
});

describe("getDashboardStats", () => {
  it("returns zero stats when no accounts", async () => {
    mockAccountsRepo.findAllAccounts.mockResolvedValue([]);
    mockPaymentsRepo.findPaymentsByAccountIds.mockResolvedValue([]);

    const stats = await getDashboardStats();

    expect(stats).toEqual({
      activeCount: 0,
      overdueCount: 0,
      dueSoonCount: 0,
      paidCount: 0,
    });
  });

  it("counts active accounts", async () => {
    const inactive = { ...mockAccount, id: "acc-2", isActive: false };
    mockAccountsRepo.findAllAccounts.mockResolvedValue([mockAccount, inactive]);
    mockPaymentsRepo.findPaymentsByAccountIds.mockResolvedValue([]);

    const stats = await getDashboardStats();

    expect(stats.activeCount).toBe(1);
  });

  it("counts paid accounts", async () => {
    mockAccountsRepo.findAllAccounts.mockResolvedValue([mockAccount]);
    mockPaymentsRepo.findPaymentsByAccountIds.mockResolvedValue([
      {
        id: "pay-1",
        accountId: "acc-1",
        year: 2026,
        month: 7,
        paid: true,
        paidAt: "2026-07-01T00:00:00.000Z",
        createdAt: "2026-07-01T00:00:00.000Z",
      },
    ]);

    const stats = await getDashboardStats();

    expect(stats.paidCount).toBe(1);
    expect(stats.overdueCount).toBe(0);
    expect(stats.dueSoonCount).toBe(0);
  });
});
