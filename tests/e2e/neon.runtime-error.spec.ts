import { test, expect } from '@playwright/test';

test('shows a visible error overlay when forced error is enabled', async ({ page }) => {
  await page.goto('/?forceError=1');

  const overlay = page.getByTestId('runtimeErrorOverlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('WebGL');
});
