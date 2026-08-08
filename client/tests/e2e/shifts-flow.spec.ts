import { test, expect } from '@playwright/test';

test.describe('Shifts Module Flow', () => {
  test('should verify shifts management, calendar, and requests', async ({ page }) => {
    // 1. Authentication
    await page.goto('/');
    await page.fill('input[type="email"]', 'owner@atlasfitness.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // 2. Shifts Dashboard
    await page.goto('/shifts');
    await page.waitForURL('**/shifts');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Shift/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Shift List
    await page.goto('/shifts/list');
    await page.waitForURL('**/shifts/list');
    await expect(page.locator('h1, h2, h3, button').filter({ hasText: /Shift/i }).first()).toBeVisible({ timeout: 10000 });

    // 4. Shift Calendar
    await page.goto('/shifts/calendar');
    await page.waitForURL('**/shifts/calendar');
    await expect(page.locator('h1, h2, h3, .fc-toolbar-title').filter({ hasText: /Calendar|Shift/i }).first()).toBeVisible({ timeout: 10000 });

    // 5. Shift Requests
    await page.goto('/shifts/requests');
    await page.waitForURL('**/shifts/requests');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Request/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
