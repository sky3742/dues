import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getNextDueDate, getDaysUntilDue, getCurrentCycle, formatDueDate } from "@/lib/utils";

describe("getNextDueDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns this month's due date for recurring account when due day hasn't passed", () => {
    vi.setSystemTime(new Date("2026-06-10"));
    const result = getNextDueDate(15, "recurring", "2026-01-01T00:00:00.000Z");
    expect(result).toEqual(new Date(2026, 5, 15));
  });

  it("returns next month's due date for recurring account when due day has passed", () => {
    vi.setSystemTime(new Date("2026-06-20"));
    const result = getNextDueDate(15, "recurring", "2026-01-01T00:00:00.000Z");
    expect(result).toEqual(new Date(2026, 6, 15));
  });

  it("handles month-end edge case: dueDay 31 in 30-day month (current month)", () => {
    vi.setSystemTime(new Date("2026-06-10"));
    const result = getNextDueDate(31, "recurring", "2026-01-01T00:00:00.000Z");
    // June has 30 days, so clamped to 30. Day 10 < 30, so returns June 30.
    expect(result).toEqual(new Date(2026, 5, 30));
  });

  it("handles month-end edge case: dueDay 31 in 30-day month (next month)", () => {
    vi.setSystemTime(new Date("2026-06-31")); // Actually July 1
    const result = getNextDueDate(31, "recurring", "2026-01-01T00:00:00.000Z");
    // July has 31 days, so clamped to 31.
    expect(result).toEqual(new Date(2026, 6, 31));
  });

  it("handles February: dueDay 15 in current month when day hasn't passed", () => {
    vi.setSystemTime(new Date("2026-01-10"));
    const result = getNextDueDate(15, "recurring", "2025-01-01T00:00:00.000Z");
    // Jan 10 < 15, so returns Jan 15
    expect(result).toEqual(new Date(2026, 0, 15));
  });

  it("handles February: dueDay 15 when day has passed, returns Feb", () => {
    vi.setSystemTime(new Date("2026-01-20"));
    const result = getNextDueDate(15, "recurring", "2025-01-01T00:00:00.000Z");
    // Jan 20 > 15, so returns Feb 15
    expect(result).toEqual(new Date(2026, 1, 15));
  });

  it("returns correct date for one-time account in creation month", () => {
    vi.setSystemTime(new Date("2026-06-10"));
    const result = getNextDueDate(15, "one_time", "2026-06-01T00:00:00.000Z");
    expect(result).toEqual(new Date(2026, 5, 15));
  });

  it("returns null for one-time account past due", () => {
    vi.setSystemTime(new Date("2026-07-10"));
    const result = getNextDueDate(15, "one_time", "2026-06-01T00:00:00.000Z");
    expect(result).toBeNull();
  });

  it("wraps to next year when current month is December and due day passed", () => {
    vi.setSystemTime(new Date("2026-12-20"));
    const result = getNextDueDate(15, "recurring", "2026-01-01T00:00:00.000Z");
    expect(result).toEqual(new Date(2027, 0, 15));
  });
});

describe("getDaysUntilDue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns positive number for future due date", () => {
    vi.setSystemTime(new Date("2026-06-10"));
    const result = getDaysUntilDue(15, "recurring", "2026-01-01T00:00:00.000Z");
    expect(result).toBe(5);
  });

  it("returns 0 for due date today", () => {
    vi.setSystemTime(new Date("2026-06-15"));
    const result = getDaysUntilDue(15, "recurring", "2026-01-01T00:00:00.000Z");
    expect(result).toBe(0);
  });

  it("returns negative number for overdue (next month's due date)", () => {
    vi.setSystemTime(new Date("2026-06-20"));
    const result = getDaysUntilDue(15, "recurring", "2026-01-01T00:00:00.000Z");
    // Due date is July 15 (25 days from June 20)
    expect(result).toBe(25);
  });

  it("returns null for one-time past due", () => {
    vi.setSystemTime(new Date("2026-07-10"));
    const result = getDaysUntilDue(15, "one_time", "2026-06-01T00:00:00.000Z");
    expect(result).toBeNull();
  });
});

describe("getCurrentCycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current month/year for recurring", () => {
    vi.setSystemTime(new Date("2026-06-15"));
    const result = getCurrentCycle("recurring", "2026-01-01T00:00:00.000Z");
    expect(result).toEqual({ year: 2026, month: 6 });
  });

  it("returns creation month/year for one-time", () => {
    vi.setSystemTime(new Date("2026-06-15"));
    const result = getCurrentCycle("one_time", "2026-03-01T00:00:00.000Z");
    expect(result).toEqual({ year: 2026, month: 3 });
  });
});

describe("formatDueDate", () => {
  it("formats date correctly", () => {
    const result = formatDueDate(15, 2026, 6);
    expect(result).toBe("Jun 15, 2026");
  });

  it("handles month-end clamping", () => {
    const result = formatDueDate(31, 2026, 2);
    expect(result).toBe("Feb 28, 2026");
  });
});
