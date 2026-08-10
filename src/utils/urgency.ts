export function getUrgencyConfig(
  isPaid: boolean,
  daysUntilDue: number | null
): { color: string; border: string } {
  if (isPaid) return { color: "text-success", border: "border-success" };
  if (daysUntilDue === null) return { color: "text-base-content/50", border: "border-base-300" };
  if (daysUntilDue <= 0) return { color: "text-error", border: "border-error" };
  if (daysUntilDue <= 3) return { color: "text-warning", border: "border-warning" };
  if (daysUntilDue <= 7) return { color: "text-orange-500", border: "border-orange-500" };
  return { color: "text-info", border: "border-info" };
}
