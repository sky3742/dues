import { togglePayment, getPaymentsForAccount } from "@/app/actions/payments";
import * as paymentService from "@/services/payment";

vi.mock("@/services/auth", () => ({
  requireSession: vi.fn().mockResolvedValue({ user: { id: "test" } }),
}));
vi.mock("@/services/payment");

const mockPaymentService = vi.mocked(paymentService);

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

describe("togglePayment action", () => {
  it("delegates to service", async () => {
    mockPaymentService.togglePayment.mockResolvedValue({ data: mockPayment });

    const result = await togglePayment("acc-1", 2026, 7);

    expect(result).toEqual({ data: mockPayment });
    expect(mockPaymentService.togglePayment).toHaveBeenCalledWith("acc-1", 2026, 7);
  });
});

describe("getPaymentsForAccount action", () => {
  it("delegates to service", async () => {
    mockPaymentService.getPaymentsForAccount.mockResolvedValue([mockPayment]);

    const result = await getPaymentsForAccount("acc-1");

    expect(result).toEqual([mockPayment]);
  });
});
