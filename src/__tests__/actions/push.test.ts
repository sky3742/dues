import { subscribeToPush, unsubscribeFromPush } from "@/app/actions/push";
import * as pushSubscriptionsRepo from "@/repositories/pushSubscriptions";

vi.mock("@/repositories/pushSubscriptions");

const mockRepo = vi.mocked(pushSubscriptionsRepo);

const mockSubscription = {
  id: "sub-1",
  endpoint: "https://example.com/push",
  p256dh: "key123",
  auth: "auth123",
  userAgent: null,
  createdAt: "2026-07-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("subscribeToPush", () => {
  it("creates new subscription when none exists", async () => {
    mockRepo.findSubscriptionByEndpoint.mockResolvedValue(null as never);
    mockRepo.insertSubscription.mockResolvedValue(mockSubscription);

    const result = await subscribeToPush({
      endpoint: "https://example.com/push",
      p256dh: "key123",
      auth: "auth123",
    });

    expect(result).toEqual({ data: mockSubscription });
    expect(mockRepo.insertSubscription).toHaveBeenCalledWith({
      endpoint: "https://example.com/push",
      p256dh: "key123",
      auth: "auth123",
    });
  });

  it("returns existing subscription if already exists", async () => {
    mockRepo.findSubscriptionByEndpoint.mockResolvedValue(mockSubscription);

    const result = await subscribeToPush({
      endpoint: "https://example.com/push",
      p256dh: "key123",
      auth: "auth123",
    });

    expect(result).toEqual({ data: mockSubscription });
    expect(mockRepo.insertSubscription).not.toHaveBeenCalled();
  });

  it("returns error when endpoint is missing", async () => {
    const result = await subscribeToPush({
      endpoint: "",
      p256dh: "key123",
      auth: "auth123",
    });

    expect(result).toHaveProperty("error");
    expect(mockRepo.insertSubscription).not.toHaveBeenCalled();
  });

  it("returns error when p256dh is missing", async () => {
    const result = await subscribeToPush({
      endpoint: "https://example.com/push",
      p256dh: "",
      auth: "auth123",
    });

    expect(result).toHaveProperty("error");
  });

  it("returns error when auth is missing", async () => {
    const result = await subscribeToPush({
      endpoint: "https://example.com/push",
      p256dh: "key123",
      auth: "",
    });

    expect(result).toHaveProperty("error");
  });
});

describe("unsubscribeFromPush", () => {
  it("deletes subscription and returns success", async () => {
    mockRepo.deleteSubscriptionByEndpoint.mockResolvedValue(undefined);

    const result = await unsubscribeFromPush({
      endpoint: "https://example.com/push",
    });

    expect(result).toEqual({ data: { success: true } });
    expect(mockRepo.deleteSubscriptionByEndpoint).toHaveBeenCalledWith("https://example.com/push");
  });

  it("returns error when endpoint is missing", async () => {
    const result = await unsubscribeFromPush({ endpoint: "" });

    expect(result).toHaveProperty("error");
    expect(mockRepo.deleteSubscriptionByEndpoint).not.toHaveBeenCalled();
  });
});
