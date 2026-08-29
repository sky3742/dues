import { createAccount, updateAccount, deleteAccount } from "@/services/account";
import * as accountsRepo from "@/repositories/accounts";

vi.mock("@/repositories/accounts");

const mockAccountsRepo = vi.mocked(accountsRepo);

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
      isActive: true,
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

  it("creates an inactive account when requested", async () => {
    mockAccountsRepo.insertAccount.mockResolvedValue({ ...mockAccount, isActive: false });

    await createAccount({
      name: "Netflix",
      type: "recurring",
      dueDay: 15,
      reminderDays: 3,
      isActive: false,
    });

    expect(mockAccountsRepo.insertAccount).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false })
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

  it("updates account active state", async () => {
    mockAccountsRepo.updateAccount.mockResolvedValue({ ...mockAccount, isActive: false });

    await updateAccount({ id: "acc-1", isActive: false });

    expect(mockAccountsRepo.updateAccount).toHaveBeenCalledWith(
      "acc-1",
      expect.objectContaining({ isActive: false })
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
