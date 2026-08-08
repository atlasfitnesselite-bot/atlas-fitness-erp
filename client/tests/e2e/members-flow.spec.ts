import { test, expect } from '@playwright/test';

test.describe('Members Module Flow', () => {
  test('should verify members directory, registration, and plans', async ({ page }) => {
    // 1. Authentication
    await page.goto('/');
    await page.fill('input[type="email"]', 'owner@atlasfitness.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // 2. Members Directory
    await page.goto('/members');
    await page.waitForURL('**/members');
    // Ensure the page renders without crashing
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Member|Members/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Member Registration
    await page.goto('/members/new');
    await page.waitForURL('**/members/new');
    await expect(page.locator('h1, h2, h3, button').filter({ hasText: /Register|New Member|Submit/i }).first()).toBeVisible({ timeout: 10000 });

    // 4. Plans / Memberships
    await page.goto('/memberships');
    await page.waitForURL('**/memberships');
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Plan|Membership/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
