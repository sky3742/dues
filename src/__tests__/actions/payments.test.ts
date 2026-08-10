import { togglePayment } from "@/app/actions/payments";
import * as paymentsRepo from "@/repositories/payments";

vi.mock("@/services/auth", () => ({
  requireSession: vi.fn().mockResolvedValue({ user: { id: "test" } }),
}));
vi.mock("@/repositories/payments");

const mockRepo = vi.mocked(paymentsRepo);

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
  it("toggles payment via repo", async () => {
    mockRepo.upsertPaidStatus.mockResolvedValue(mockPayment);

    const result = await togglePayment("acc-1", 2026, 7);

    expect(result).toEqual(mockPayment);
    expect(mockRepo.upsertPaidStatus).toHaveBeenCalledWith("acc-1", 2026, 7);
  });
});
