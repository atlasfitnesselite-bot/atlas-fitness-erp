import { test, expect } from '@playwright/test';

test.describe('Billing & Operations Flow', () => {
  test('should verify billing, expenses, and assets', async ({ page }) => {
    // 1. Authentication
    await page.goto('/');
    await page.fill('input[type="email"]', 'owner@atlasfitness.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // 2. Billing Dashboard
    await page.goto('/billing');
    await page.waitForURL('**/billing');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Billing|Invoice/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Expenses
    await page.goto('/expenses');
    await page.waitForURL('**/expenses');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Expense/i }).first()).toBeVisible({ timeout: 10000 });

    // 4. Assets
    await page.goto('/assets');
    await page.waitForURL('**/assets');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Asset/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
