import { test, expect } from '@playwright/test'

test('simulation advances when ticksPerSecond is enabled', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()

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
