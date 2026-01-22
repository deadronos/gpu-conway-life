import { test, expect } from '@playwright/test';

test('shows a full-screen fallback overlay when forced unsupported', async ({ page }) => {
  await page.goto('/?forceUnsupported=1');

  const overlay = page.getByTestId('unsupportedOverlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('EXT_color_buffer_float');

  const zIndex = await overlay.evaluate(el => {
    const z = window.getComputedStyle(el).zIndex;
    const n = Number.parseInt(z || '0', 10);
    return Number.isFinite(n) ? n : 0;
  });
  expect(zIndex).toBeGreaterThanOrEqual(1000);

  const pointerEvents = await overlay.evaluate(el => window.getComputedStyle(el).pointerEvents);
  expect(pointerEvents).not.toBe('none');
});
