import { test, expect } from "@playwright/test";

const ts = Date.now();

test.describe("Dashboard", () => {
  test("shows + Add link and stats", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "+ Add" })).toBeVisible();
    await expect(page.getByText("Overdue")).toBeVisible();
    await expect(page.getByText("Due Soon")).toBeVisible();
    await expect(page.getByText("Total Accounts")).toBeVisible();
  });

  test("navigation to create account page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "+ Add" }).click();
    await expect(page).toHaveURL("/accounts/new");
    await expect(page.getByText("Create Account")).toBeVisible();
  });
});

test.describe("Account Management", () => {
  test("create a new recurring account", async ({ page }) => {
    const name = `R-${ts}`;
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill(name);
    await page.locator('input[name="dueDay"]').fill("15");
    await page.locator('input[name="reminderDays"]').fill("5");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page).toHaveURL("/accounts");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  });

  test("create a one-time account", async ({ page }) => {
    const name = `O-${ts}`;
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill(name);
    await page.locator('select[name="type"]').selectOption("one_time");
    await page.locator('input[name="dueDay"]').fill("1");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page).toHaveURL("/accounts");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  });

  test("edit an existing account", async ({ page }) => {
    const name = `E-${ts}`;
    const updated = `U-${ts}`;
    // Create
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill(name);
    await page.locator('input[name="dueDay"]').fill("10");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page).toHaveURL("/accounts");

    // Edit
    await page.locator(".card", { hasText: name }).getByRole("link", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/accounts\/.*\/edit/);
    await expect(page.getByRole("button", { name: "Update" })).toBeVisible();

    await page.getByPlaceholder("e.g. Rent, Internet").clear();
    await page.getByPlaceholder("e.g. Rent, Internet").fill(updated);
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page).toHaveURL("/accounts");
    await expect(page.getByRole("heading", { name: updated, exact: true })).toBeVisible();
  });

  test("navigate back from create form", async ({ page }) => {
    await page.goto("/accounts/new");
    await page.getByText("← Back to Accounts").click();
    await expect(page).toHaveURL("/accounts");
  });

  test("navigate back from accounts list", async ({ page }) => {
    await page.goto("/accounts");
    await page.getByText("← Back to Dashboard").click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Dashboard with accounts", () => {
  test("displays account cards with due info", async ({ page }) => {
    const name = `D-${ts}`;
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill(name);
    await page.locator('input[name="dueDay"]').fill("25");
    await page.getByRole("button", { name: "Create" }).click();
    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  });

  test("toggle payment status on dashboard", async ({ page }) => {
    const name = `T-${ts}`;
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill(name);
    await page.locator('input[name="dueDay"]').fill("15");
    await page.getByRole("button", { name: "Create" }).click();
    await page.goto("/");
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();

    await page
      .locator(".alert", { hasText: name })
      .getByRole("button", { name: "Mark Paid" })
      .click();
    await expect(
      page.locator(".alert", { hasText: name }).getByRole("button", { name: "Paid" })
    ).toBeVisible();
  });
});
