/**
 * Calculate the next due date for an account.
 *
 * For recurring: the next occurrence of dueDay (this month or next).
 * For one-time: the dueDay of the creation month (past due → null).
 *
 * Handles month-end edge cases (e.g. dueDay=31 in Feb → Feb 28/29).
 */

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampToMonthEnd(year: number, month: number, day: number): number {
  const maxDay = getDaysInMonth(year, month);
  return Math.min(day, maxDay);
}

export function getNextDueDate(
  dueDay: number,
  type: "recurring" | "one_time",
  createdAt: string
): Date | null {
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const currentYear = now.getFullYear();

  if (type === "one_time") {
    const created = new Date(createdAt);
    const createdMonth = created.getMonth() + 1;
    const createdYear = created.getFullYear();
    const clamped = clampToMonthEnd(createdYear, createdMonth, dueDay);
    const dueDate = new Date(createdYear, createdMonth - 1, clamped);

    // If past due, no more notifications
    if (dueDate < now) return null;
    return dueDate;
  }

  // Recurring: find next occurrence
  const clamped = clampToMonthEnd(currentYear, currentMonth, dueDay);

  // If due day hasn't passed this month, use this month
  if (today <= clamped) {
    return new Date(currentYear, currentMonth - 1, clamped);
  }

  // Otherwise, next month
  let nextMonth = currentMonth + 1;
  let nextYear = currentYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }
  const nextClamped = clampToMonthEnd(nextYear, nextMonth, dueDay);
  return new Date(nextYear, nextMonth - 1, nextClamped);
}

/**
 * Calculate days until the next due date.
 * Returns negative number if overdue.
 * Returns null if no due date (one-time past due).
 */
export function getDaysUntilDue(
  dueDay: number,
  type: "recurring" | "one_time",
  createdAt: string
): number | null {
  const nextDue = getNextDueDate(dueDay, type, createdAt);
  if (!nextDue) return null;

  const now = new Date();
  // Reset time parts for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());

  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get the current billing cycle year/month for an account.
 * For recurring: current month/year.
 * For one-time: creation month/year.
 */
export function getCurrentCycle(
  type: "recurring" | "one_time",
  createdAt: string
): { year: number; month: number } {
  const now = new Date();

  if (type === "one_time") {
    const created = new Date(createdAt);
    return { year: created.getFullYear(), month: created.getMonth() + 1 };
  }

  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Format a due date for display.
 */
export function formatDueDate(dueDay: number, year: number, month: number): string {
  const clamped = clampToMonthEnd(year, month, dueDay);
  const date = new Date(year, month - 1, clamped);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
