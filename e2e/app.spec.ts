import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("shows empty state when no accounts exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("No accounts yet")).toBeVisible();
    await expect(page.getByText("+ Add")).toBeVisible();
  });

  test("shows stats with zero counts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Overdue")).toBeVisible();
    await expect(page.getByText("Due Soon")).toBeVisible();
    await expect(page.getByText("Total Accounts")).toBeVisible();
  });

  test("navigation to create account page", async ({ page }) => {
    await page.goto("/");
    await page.getByText("+ Add").click();
    await expect(page).toHaveURL("/accounts/new");
    await expect(page.getByText("Create Account")).toBeVisible();
  });
});

test.describe("Account Management", () => {
  test("create a new recurring account", async ({ page }) => {
    await page.goto("/accounts/new");

    await page.getByPlaceholder("e.g. Rent, Internet").fill("Internet");
    await page.getByLabel("Due Day (1-31)").fill("15");
    await page.getByLabel("Remind me (days before)").fill("5");

    await page.getByRole("button", { name: "Create" }).click();

    // Should redirect to accounts page
    await expect(page).toHaveURL("/accounts");
    await expect(page.getByText("Internet")).toBeVisible();
  });

  test("create a one-time account", async ({ page }) => {
    await page.goto("/accounts/new");

    await page.getByPlaceholder("e.g. Rent, Internet").fill("Car Repair");
    await page.selectOption("select[name='type']", "one_time");
    await page.getByLabel("Due Day (1-31)").fill("1");

    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL("/accounts");
    await expect(page.getByText("Car Repair")).toBeVisible();
  });

  test("edit an existing account", async ({ page }) => {
    // First create an account
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill("Test Account");
    await page.getByLabel("Due Day (1-31)").fill("10");
    await page.getByRole("button", { name: "Create" }).click();

    // Click edit
    await page.getByText("Edit").first().click();
    await expect(page).toHaveURL(/\/accounts\/.*\/edit/);

    // Update the name
    await page.getByPlaceholder("e.g. Rent, Internet").clear();
    await page.getByPlaceholder("e.g. Rent, Internet").fill("Updated Account");
    await page.getByRole("button", { name: "Update" }).click();

    await expect(page).toHaveURL("/accounts");
    await expect(page.getByText("Updated Account")).toBeVisible();
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
  test("displays account cards with status", async ({ page }) => {
    // Create an account first
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill("Rent");
    await page.getByLabel("Due Day (1-31)").fill("1");
    await page.getByRole("button", { name: "Create" }).click();

    // Go to dashboard
    await page.goto("/");
    await expect(page.getByText("Rent")).toBeVisible();
    await expect(page.getByText("Recurring")).toBeVisible();
  });

  test("toggle payment status on dashboard", async ({ page }) => {
    // Create an account
    await page.goto("/accounts/new");
    await page.getByPlaceholder("e.g. Rent, Internet").fill("Electric Bill");
    await page.getByLabel("Due Day (1-31)").fill("15");
    await page.getByRole("button", { name: "Create" }).click();

    // Go to dashboard
    await page.goto("/");
    await expect(page.getByText("Electric Bill")).toBeVisible();

    // Click Mark Paid button
    await page.getByRole("button", { name: "Mark Paid" }).first().click();

    // Should show Paid status
    await expect(page.getByRole("button", { name: "Paid" }).first()).toBeVisible();
  });
});
