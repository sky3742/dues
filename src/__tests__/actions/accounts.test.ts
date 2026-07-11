import {
  createAccount,
  updateAccount,
  deleteAccount,
  toggleAccountActive,
  getAccounts,
  getAccount,
} from "@/app/actions/accounts";
import * as accountService from "@/services/account";

vi.mock("@/services/account");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockAccountService = vi.mocked(accountService);

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

describe("createAccount action", () => {
  it("delegates to service and returns result", async () => {
    mockAccountService.createAccount.mockResolvedValue({ data: mockAccount });

    const result = await createAccount({
      name: "Netflix",
      type: "recurring",
      dueDay: 15,
      reminderDays: 3,
    });

    expect(result).toEqual({ data: mockAccount });
  });

  it("returns error from service without revalidating", async () => {
    mockAccountService.createAccount.mockResolvedValue({ error: "Name is required" });

    const result = await createAccount({
      name: "",
      type: "recurring",
      dueDay: 15,
      reminderDays: 3,
    });

    expect(result).toEqual({ error: "Name is required" });
  });
});

describe("updateAccount action", () => {
  it("delegates to service", async () => {
    mockAccountService.updateAccount.mockResolvedValue({ data: mockAccount });

    const result = await updateAccount({ id: "acc-1", name: "Updated" });

    expect(result).toEqual({ data: mockAccount });
  });

  it("returns error from service", async () => {
    mockAccountService.updateAccount.mockResolvedValue({ error: "Account not found" });

    const result = await updateAccount({ id: "nonexistent", name: "Updated" });

    expect(result).toEqual({ error: "Account not found" });
  });
});

describe("deleteAccount action", () => {
  it("delegates to service", async () => {
    mockAccountService.deleteAccount.mockResolvedValue({ data: mockAccount });

    const result = await deleteAccount("acc-1");

    expect(result).toEqual({ data: mockAccount });
  });

  it("returns error from service", async () => {
    mockAccountService.deleteAccount.mockResolvedValue({ error: "Account not found" });

    const result = await deleteAccount("nonexistent");

    expect(result).toEqual({ error: "Account not found" });
  });
});

describe("toggleAccountActive action", () => {
  it("delegates to service", async () => {
    mockAccountService.toggleAccountActive.mockResolvedValue({ data: mockAccount });

    const result = await toggleAccountActive("acc-1");

    expect(result).toEqual({ data: mockAccount });
  });

  it("returns error from service", async () => {
    mockAccountService.toggleAccountActive.mockResolvedValue({ error: "Account not found" });

    const result = await toggleAccountActive("nonexistent");

    expect(result).toEqual({ error: "Account not found" });
  });
});

describe("getAccounts action", () => {
  it("delegates to service", async () => {
    mockAccountService.getAccounts.mockResolvedValue([mockAccount]);

    const result = await getAccounts();

    expect(result).toEqual([mockAccount]);
  });
});

describe("getAccount action", () => {
  it("delegates to service", async () => {
    mockAccountService.getAccount.mockResolvedValue(mockAccount);

    const result = await getAccount("acc-1");

    expect(result).toEqual(mockAccount);
  });

  it("returns null when not found", async () => {
    mockAccountService.getAccount.mockResolvedValue(null as never);

    const result = await getAccount("nonexistent");

    expect(result).toBeNull();
  });
});
