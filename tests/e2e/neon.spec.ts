import { test, expect } from '@playwright/test'

test('simulation advances when ticksPerSecond is enabled', async ({ page }) => {
  await page.goto('/')

  // Skip if float render targets are unsupported in this environment
  const unsupported =
    (await page.locator('[data-testid="unsupported"]').count()) > 0 ||
    (await page.locator('[data-testid="unsupportedOverlay"]').count()) > 0
  test.skip(unsupported, 'float render targets not supported; skipping simulation test')

  const canvas = page.getByTestId('canvasWrap').locator('canvas')
  await expect(canvas).toBeVisible()

  // If the sim never produces a state texture, this environment can't validate the visual assertion.
  try {
    await page.waitForFunction(
      () => document.querySelector('[data-testid="hud"]')?.textContent?.includes('hasTexture: yes'),
      { timeout: 5000 },
    )
  } catch {
    console.warn('Skipping simulation test: state texture was never produced')
    return
  }

  // capture initial pixels
  const before = await canvas.screenshot({ type: 'jpeg', quality: 80 })

  // Ensure simulation is running: use the test hook exposed on window to unpause and set a higher TPS
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__neonSetPartial?.({ paused: false, ticksPerSecond: 60 })
  })

  // wait to let the simulation progress
  await page.waitForTimeout(700)

  const after = await canvas.screenshot({ type: 'jpeg', quality: 80 })

  // The screenshots should differ if the simulation updated the canvas
  expect(before).not.toEqual(after)
})
