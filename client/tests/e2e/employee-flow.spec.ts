import { test, expect } from '@playwright/test';

test.describe('Employee Management Module Flow', () => {
  test('should verify employee directory, departments, designations, and org chart', async ({ page }) => {
    // 1. Authentication
    await page.goto('/');
    await page.fill('input[type="email"]', 'owner@atlasfitness.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // 2. Employees Directory
    await page.goto('/employees');
    await page.waitForURL('**/employees');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Employee|Staff/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Departments
    await page.goto('/departments');
    await page.waitForURL('**/departments');
    await expect(page.locator('h1, h2, h3, button').filter({ hasText: /Department/i }).first()).toBeVisible({ timeout: 10000 });

    // 4. Designations
    await page.goto('/designations');
    await page.waitForURL('**/designations');
    await expect(page.locator('h1, h2, h3, button').filter({ hasText: /Designation/i }).first()).toBeVisible({ timeout: 10000 });

    // 5. Employment Types
    await page.goto('/employment-types');
    await page.waitForURL('**/employment-types');
    await expect(page.locator('h1, h2, h3, button').filter({ hasText: /Employment/i }).first()).toBeVisible({ timeout: 10000 });

    // 6. Org Chart
    await page.goto('/org-structure');
    await page.waitForURL('**/org-structure');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Org|Structure/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
