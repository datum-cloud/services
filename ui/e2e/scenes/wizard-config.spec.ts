import { test, expect } from '@playwright/test';

test('new configuration wizard', async ({ page }) => {
  // Navigate via the configurations tab so viewers see the entry point
  await page.goto('/services/compute-miloapis-com?tab=configurations');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2_500);

  // ── Wizard — step 1: Version & source ────────────────────────────────────
  await page.goto('/services/compute-miloapis-com/configurations/new');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: /new configuration/i })
  ).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(2_000);

  // Type a divergent version string to reveal the suggestion alert
  const versionInput = page.getByLabel(/version/i).first();
  if (await versionInput.isVisible()) {
    await versionInput.fill('');
    await versionInput.pressSequentially('v2', { delay: 80 });
    await page.waitForTimeout(2_000);
  }

  // ── Step 2 — Monitored resource types ─────────────────────────────────────
  const nextBtn = page.getByRole('button', { name: /next/i });
  await nextBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2_500);

  // ── Step 3 — Meters ───────────────────────────────────────────────────────
  await nextBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2_500);

  // ── Step 4 — Review ───────────────────────────────────────────────────────
  await nextBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3_000);
});
