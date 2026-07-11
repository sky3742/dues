import { accountSchema } from "@/schemas/account";

describe("accountSchema", () => {
  const valid = {
    name: "Netflix",
    type: "recurring" as const,
    dueDay: 15,
    reminderDays: 3,
  };

  it("accepts valid input", () => {
    const result = accountSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = accountSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = accountSchema.safeParse({ ...valid, name: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = accountSchema.safeParse({ ...valid, type: "monthly" });
    expect(result.success).toBe(false);
  });

  it("accepts one_time type", () => {
    const result = accountSchema.safeParse({ ...valid, type: "one_time" });
    expect(result.success).toBe(true);
  });

  it("rejects dueDay < 1", () => {
    const result = accountSchema.safeParse({ ...valid, dueDay: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects dueDay > 31", () => {
    const result = accountSchema.safeParse({ ...valid, dueDay: 32 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer dueDay", () => {
    const result = accountSchema.safeParse({ ...valid, dueDay: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects reminderDays < 0", () => {
    const result = accountSchema.safeParse({ ...valid, reminderDays: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects reminderDays > 30", () => {
    const result = accountSchema.safeParse({ ...valid, reminderDays: 31 });
    expect(result.success).toBe(false);
  });

  it("accepts reminderDays at boundary (0)", () => {
    const result = accountSchema.safeParse({ ...valid, reminderDays: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts reminderDays at boundary (30)", () => {
    const result = accountSchema.safeParse({ ...valid, reminderDays: 30 });
    expect(result.success).toBe(true);
  });

  it("accepts dueDay at boundary (1)", () => {
    const result = accountSchema.safeParse({ ...valid, dueDay: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts dueDay at boundary (31)", () => {
    const result = accountSchema.safeParse({ ...valid, dueDay: 31 });
    expect(result.success).toBe(true);
  });

  it("strips extra fields", () => {
    const result = accountSchema.safeParse({ ...valid, extra: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("extra");
    }
  });
});
