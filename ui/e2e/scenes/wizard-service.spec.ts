import { test, expect } from '@playwright/test';

test('new service wizard', async ({ page }) => {
  await page.goto('/services/new');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: /new service/i })
  ).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(1_500);

  // ── Step 1 — Service identity ─────────────────────────────────────────────
  await page.getByLabel(/display name/i).pressSequentially('Analytics Platform', { delay: 60 });
  await page.waitForTimeout(800);
  await page.getByLabel(/description/i).pressSequentially(
    'Usage analytics and cost attribution for Milo-hosted workloads.',
    { delay: 30 }
  );
  await page.waitForTimeout(800);
  await page.getByLabel(/owner project/i).pressSequentially('platform-producer-project', {
    delay: 40,
  });
  await page.waitForTimeout(2_000);

  // ── Step 2 — Monitored resource types ─────────────────────────────────────
  const nextBtn = page.getByRole('button', { name: /next/i });
  await nextBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1_500);

  const addMrtBtn = page.getByRole('button', { name: /add.*resource type|add mrt/i }).first();
  if (await addMrtBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await addMrtBtn.click();
    await page.waitForTimeout(500);
    const typeInput = page.getByPlaceholder(/resource type/i).first();
    if (await typeInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await typeInput.pressSequentially('analytics.miloapis.com/Job', { delay: 40 });
    }
    await page.waitForTimeout(2_000);
  } else {
    await page.waitForTimeout(2_000);
  }

  // ── Step 3 — Meters ───────────────────────────────────────────────────────
  await nextBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2_500);

  // ── Step 4 — Review ───────────────────────────────────────────────────────
  await nextBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3_000);
});
