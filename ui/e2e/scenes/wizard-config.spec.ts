import { test } from '@playwright/test';

const SERVICE = 'compute-miloapis-com';

test('new configuration wizard', async ({ page }) => {
  // ── Wizard — step 1: Version & source ────────────────────────────────────
  await page.goto(`/services/${SERVICE}/configurations/new`);
  await page.waitForLoadState('networkidle');
  // Wait for either the heading or an error state — either renders h1.
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2_000);

  // Type a divergent semver to reveal the "Version suggestion" alert.
  const versionInput = page.getByLabel(/^version$/i);
  if (await versionInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await versionInput.fill('2.0.0');
    await page.waitForTimeout(2_000);
  } else {
    await page.waitForTimeout(2_000);
  }

  // ── Step 2 — Monitored resource types ─────────────────────────────────────
  const nextButton = page.getByRole('button', { name: /^next/i });
  if (await nextButton.isEnabled({ timeout: 2_000 }).catch(() => false)) {
    await nextButton.click();
    await page.waitForURL(/[?&]step=2/, { timeout: 10_000 }).catch(() => {});
  }
  await page.waitForTimeout(2_500);

  // ── Step 3 — Meters ───────────────────────────────────────────────────────
  if (await nextButton.isEnabled({ timeout: 1_000 }).catch(() => false)) {
    await nextButton.click();
    await page.waitForURL(/[?&]step=3/, { timeout: 10_000 }).catch(() => {});
  }
  await page.waitForTimeout(2_500);

  // ── Step 4 — Review & create ──────────────────────────────────────────────
  if (await nextButton.isEnabled({ timeout: 1_000 }).catch(() => false)) {
    await nextButton.click();
    await page.waitForURL(/[?&]step=4/, { timeout: 10_000 }).catch(() => {});
  }
  await page.waitForTimeout(3_000);
});
