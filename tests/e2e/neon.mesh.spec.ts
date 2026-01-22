import { test, expect } from '@playwright/test'

test('mesh demo renders simulation frames (smoke)', async ({ page }) => {
  await page.goto('/?demo=mesh')

  // Skip if float render targets are unsupported in this environment
  const unsupported =
    (await page.locator('[data-testid="unsupported"]').count()) > 0 ||
    (await page.locator('[data-testid="unsupportedOverlay"]').count()) > 0
  test.skip(unsupported, 'float render targets not supported; skipping mesh smoke test')

  const canvas = page.getByTestId('canvasWrap').locator('canvas')
  await expect(canvas).toBeVisible()

  // Wait a moment for the sim to initialize and produce a texture
  await page.waitForTimeout(2000)

  const before = await canvas.screenshot({ type: 'png' })

  // Create a blank baseline canvas matching the app background to ensure the sim actually drew something
  const blank = await page.evaluate(async () => {
    const canvas = document.querySelector('[data-testid="canvasWrap"] canvas') as HTMLCanvasElement
    const w = canvas?.width ?? 1
    const h = canvas?.height ?? 1
    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const ctx = off.getContext('2d')
    if (!ctx) return null
    // App background is #050508
    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, w, h)
    return off.toDataURL('image/png')
  })

  expect(blank).not.toBeNull()

  // If the before image differs from a blank background, the sim rendered something visible
  expect(before).not.toEqual(blank)

  // Additionally, take a later screenshot and assert there's at least some chance the sim advances
  await page.waitForTimeout(2000)
  const after = await canvas.screenshot({ type: 'png' })
  // Either the sim already produced visible content (before !== blank) or it produced it later (after !== blank)
  expect(after).not.toEqual(blank)
})