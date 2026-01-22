import { test, expect } from '@playwright/test';

test('shows a full-screen fallback overlay when floatRTSupported becomes false (not forced)', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('canvas').first()).toBeVisible();
  await page.waitForFunction(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof (window as any).__neonSetPartial === 'function';
  });

  // Give the app a moment to finish any initial runtime capability detection.
  await page.waitForTimeout(250);

  // Toggle float RT support off via the existing test hook (without using ?forceUnsupported=1).
  // We also set paused=true to keep the sim from animating in the background.
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__neonSetPartial?.({ floatRTSupported: false, paused: true });
  });

  const overlay = page.getByTestId('unsupportedOverlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('EXT_color_buffer_float');

  const overlayInfo = await page.evaluate(() => {
    const overlay = document.querySelector('[data-testid="unsupportedOverlay"]');
    if (!overlay) return null;

    const z = window.getComputedStyle(overlay).zIndex;
    const zIndex = Number.isFinite(Number.parseInt(z || '0', 10))
      ? Number.parseInt(z || '0', 10)
      : 0;
    const pointerEvents = window.getComputedStyle(overlay).pointerEvents;

    const top = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const isTopMostAtCenter = !!top && overlay.contains(top);

    return { zIndex, pointerEvents, isTopMostAtCenter };
  });

  expect(overlayInfo?.zIndex).toBeGreaterThanOrEqual(1000);
  expect(overlayInfo?.pointerEvents).not.toBe('none');
  expect(overlayInfo?.isTopMostAtCenter).toBe(true);
});
