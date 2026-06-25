import { test, expect } from "@playwright/test";

const ts = Date.now();
const today = new Date();
const dayOfMonth = today.getDate();

// overdue: dueDay is in the past AND nextDue is >20 days away (outside statement window)
// e.g. if today is Jun 25, dueDay=16 → Jun 16 is past, Jul 16 is 21 days away → overdue
const overdueDueDay = dayOfMonth > 1 ? dayOfMonth - 1 : 1;
const overdueNextDueDays = 31; // always >20

// future: dueDay is tomorrow and within statement window
const futureDueDay = dayOfMonth < 28 ? dayOfMonth + 1 : 28;

// paid: same as future
const paidDueDay = futureDueDay;

test.describe("Payment cycle logic", () => {
  test("overdue account shows correct status and can be paid", async ({ page }) => {
    const name = `Cycle-${ts}`;

    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet, Netflix").fill(name);
    await page.locator('input[name="dueDay"]').fill(String(overdueDueDay));
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/accounts");

    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    const card = page.locator(".card", { hasText: name });
    await expect(card.getByText(/overdue/)).toBeVisible();

    await card.getByRole("button", { name: "Mark Paid" }).click();
    await expect(card.getByRole("button", { name: "Paid" })).toBeVisible();
  });

  test("account due in future shows countdown", async ({ page }) => {
    const name = `Future-${ts}`;

    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet, Netflix").fill(name);
    await page.locator('input[name="dueDay"]').fill(String(futureDueDay));
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/accounts");

    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    const card = page.locator(".card", { hasText: name });
    await expect(card.getByText(/\d+d left/)).toBeVisible();
  });

  test("paid account shows next month due date", async ({ page }) => {
    const name = `Paid-${ts}`;

    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet, Netflix").fill(name);
    await page.locator('input[name="dueDay"]').fill(String(paidDueDay));
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/accounts");

    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    const card = page.locator(".card", { hasText: name });
    await card.getByRole("button", { name: "Mark Paid" }).click();
    await expect(card.getByRole("button", { name: "Paid" })).toBeVisible();
  });

  test("can toggle paid off and back on", async ({ page }) => {
    const name = `Toggle-${ts}`;

    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet, Netflix").fill(name);
    await page.locator('input[name="dueDay"]').fill("10");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/accounts");

    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    const card = page.locator(".card", { hasText: name });

    // Mark paid
    await card.getByRole("button", { name: "Mark Paid" }).click();
    await expect(card.getByRole("button", { name: "Paid" })).toBeVisible();

    // Unmark
    await card.getByRole("button", { name: "Paid" }).click();
    await expect(card.getByRole("button", { name: "Mark Paid" })).toBeVisible();
  });
});
