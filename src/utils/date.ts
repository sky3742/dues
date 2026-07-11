function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampToMonthEnd(year: number, month: number, day: number): number {
  const maxDay = getDaysInMonth(year, month);
  return Math.min(day, maxDay);
}

/**
 * Get this month's due date for an account.
 * For recurring: always returns this month's due date (even if past).
 * For one-time: returns creation month's due date, or null if past.
 */
export function getCurrentDueDate(
  dueDay: number,
  type: "recurring" | "one_time",
  createdAt: string
): Date | null {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (type === "one_time") {
    const created = new Date(createdAt);
    const createdMonth = created.getMonth() + 1;
    const createdYear = created.getFullYear();
    const clamped = clampToMonthEnd(createdYear, createdMonth, dueDay);
    const dueDate = new Date(createdYear, createdMonth - 1, clamped);
    if (dueDate < now) return null;
    return dueDate;
  }

  const clamped = clampToMonthEnd(currentYear, currentMonth, dueDay);
  return new Date(currentYear, currentMonth - 1, clamped);
}

/**
 * Get the next future due date for an account.
 * For recurring: this month if not yet due, otherwise next month.
 * For one-time: creation month's due date, or null if past.
 */
export function getNextDueDate(
  dueDay: number,
  type: "recurring" | "one_time",
  createdAt: string
): Date | null {
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (type === "one_time") {
    const created = new Date(createdAt);
    const createdMonth = created.getMonth() + 1;
    const createdYear = created.getFullYear();
    const clamped = clampToMonthEnd(createdYear, createdMonth, dueDay);
    const dueDate = new Date(createdYear, createdMonth - 1, clamped);
    if (dueDate < now) return null;
    return dueDate;
  }

  const clamped = clampToMonthEnd(currentYear, currentMonth, dueDay);

  if (today <= clamped) {
    return new Date(currentYear, currentMonth - 1, clamped);
  }

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
 * Calculate days until the due date.
 * Returns negative number if overdue (past due date and unpaid).
 * Returns null if no due date (one-time past due).
 */
export function getDaysUntilDue(
  dueDay: number,
  type: "recurring" | "one_time",
  createdAt: string
): number | null {
  const dueDate = getCurrentDueDate(dueDay, type, createdAt);
  if (!dueDate) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get the billing cycle year/month for the current due date.
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
