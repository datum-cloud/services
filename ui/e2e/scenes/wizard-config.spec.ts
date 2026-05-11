import { test, expect } from '@playwright/test';

const SERVICE = 'compute-miloapis-com';

test('new configuration wizard', async ({ page }) => {
  // ── Entry point: configurations tab ──────────────────────────────────────
  await page.goto(`/services/${SERVICE}?tab=configurations`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2_500);

  // ── Wizard — step 1: Version & source ────────────────────────────────────
  await page.goto(`/services/${SERVICE}/configurations/new`);
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('heading', { name: /^new configuration$/i })
  ).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(2_000);

  // Type a divergent semver to reveal the "Version suggestion" alert
  const versionInput = page.getByLabel(/^version$/i);
  await versionInput.fill('2.0.0');
  await page.waitForTimeout(2_000);

  // ── Step 2 — Monitored resource types ─────────────────────────────────────
  const nextButton = page.getByRole('button', { name: /^next/i });
  await nextButton.click();
  await expect(page).toHaveURL(/[?&]step=2/, { timeout: 10_000 });
  await page.waitForTimeout(2_500);

  // ── Step 3 — Meters ───────────────────────────────────────────────────────
  await nextButton.click();
  await expect(page).toHaveURL(/[?&]step=3/, { timeout: 10_000 });
  await page.waitForTimeout(2_500);

  // ── Step 4 — Review & create ──────────────────────────────────────────────
  await nextButton.click();
  await expect(page).toHaveURL(/[?&]step=4/, { timeout: 10_000 });
  await page.waitForTimeout(3_000);
});
