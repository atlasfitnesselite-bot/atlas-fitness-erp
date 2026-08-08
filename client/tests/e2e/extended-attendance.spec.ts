import { test, expect } from '@playwright/test';

test.describe('Extended Attendance & Leaves Flow', () => {
  test('should verify attendance settings, analytics, leave types and holidays', async ({ page }) => {
    // 1. Authentication
    await page.goto('/');
    await page.fill('input[type="email"]', 'owner@atlasfitness.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // 2. Attendance Analytics
    await page.goto('/attendance/analytics');
    await page.waitForURL('**/attendance/analytics');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Analytic/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Attendance Settings
    await page.goto('/attendance/settings');
    await page.waitForURL('**/attendance/settings');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Setting/i }).first()).toBeVisible({ timeout: 10000 });

    // 4. Leave Types
    await page.goto('/leave/types');
    await page.waitForURL('**/leave/types');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Type/i }).first()).toBeVisible({ timeout: 10000 });

    // 5. Leave Balances
    await page.goto('/leave/balances');
    await page.waitForURL('**/leave/balances');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Balance/i }).first()).toBeVisible({ timeout: 10000 });

    // 6. Holiday Calendar
    await page.goto('/leave/holidays');
    await page.waitForURL('**/leave/holidays');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Holiday/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
