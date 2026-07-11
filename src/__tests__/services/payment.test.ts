import { togglePayment, getPaymentsForAccount } from "@/services/payment";
import * as paymentsRepo from "@/repositories/payments";

vi.mock("@/repositories/payments");

const mockPaymentsRepo = vi.mocked(paymentsRepo);

const mockPayment = {
  id: "pay-1",
  accountId: "acc-1",
  year: 2026,
  month: 7,
  paid: true,
  paidAt: "2026-07-01T00:00:00.000Z",
  createdAt: "2026-07-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("togglePayment", () => {
  it("toggles payment via repository", async () => {
    mockPaymentsRepo.upsertPaidStatus.mockResolvedValue(mockPayment);

    const result = await togglePayment("acc-1", 2026, 7);

    expect(result).toEqual({ data: mockPayment });
    expect(mockPaymentsRepo.upsertPaidStatus).toHaveBeenCalledWith("acc-1", 2026, 7);
  });
});

describe("getPaymentsForAccount", () => {
  it("returns payments for account", async () => {
    mockPaymentsRepo.findPaymentsByAccountId.mockResolvedValue([mockPayment]);

    const result = await getPaymentsForAccount("acc-1");

    expect(result).toEqual([mockPayment]);
  });

  it("returns empty array when no payments", async () => {
    mockPaymentsRepo.findPaymentsByAccountId.mockResolvedValue([]);

    const result = await getPaymentsForAccount("acc-1");

    expect(result).toEqual([]);
  });
});
