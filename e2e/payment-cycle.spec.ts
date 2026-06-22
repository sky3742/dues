import { test, expect } from "@playwright/test";

const ts = Date.now();

test.describe("Payment cycle logic", () => {
  test("overdue account shows correct status and can be paid", async ({ page }) => {
    const name = `Cycle-${ts}`;

    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet, Netflix").fill(name);
    await page.locator('input[name="dueDay"]').fill("15");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/accounts");

    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    const card = page.locator(".card", { hasText: name });
    await expect(card.getByText(/Overdue/)).toBeVisible();
    await expect(card.getByText("Due: Jun 15, 2026")).toBeVisible();

    await card.getByRole("button", { name: "Mark Paid" }).click();
    await expect(card.getByRole("button", { name: "Paid" })).toBeVisible();
    await expect(card.getByText("Paid — next due Jul 15, 2026")).toBeVisible();
  });

  test("account due in future shows countdown", async ({ page }) => {
    const name = `Future-${ts}`;

    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet, Netflix").fill(name);
    await page.locator('input[name="dueDay"]').fill("25");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/accounts");

    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    const card = page.locator(".card", { hasText: name });
    await expect(card.getByText("Due: Jun 25, 2026")).toBeVisible();
    await expect(card.getByText(/3 days? left/)).toBeVisible();
  });

  test("paid account shows next month due date", async ({ page }) => {
    const name = `Paid-${ts}`;

    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet, Netflix").fill(name);
    await page.locator('input[name="dueDay"]').fill("25");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL("/accounts");

    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    const card = page.locator(".card", { hasText: name });
    await card.getByRole("button", { name: "Mark Paid" }).click();
    await expect(card.getByRole("button", { name: "Paid" })).toBeVisible();
    await expect(card.getByText("Paid — next due Jul 25, 2026")).toBeVisible();
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
