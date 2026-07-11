import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["recurring", "one_time"]),
  dueDay: z
    .number()
    .int()
    .min(1, "Due day must be between 1 and 31")
    .max(31, "Due day must be between 1 and 31"),
  reminderDays: z
    .number()
    .int()
    .min(0, "Reminder days must be between 0 and 30")
    .max(30, "Reminder days must be between 0 and 30")
    .optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;
