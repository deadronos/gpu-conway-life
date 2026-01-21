import { test, expect } from '@playwright/test'

test('cellSize affects visual scale', async ({ page }) => {
  await page.goto('/')

  // Skip if float render targets are unsupported in this environment
  const unsupported = await page.locator('[data-testid="unsupported"]').count()
  test.skip(unsupported > 0, 'float render targets not supported; skipping visual test')

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()

  // Ensure sim runs
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__neonSetPartial?.({ paused: false, ticksPerSecond: 30 })
  })

  // Helper to capture brightness sum of the canvas by drawing it to 2D context
  const getBrightness = async () => {
    return await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return 0
      const tmp = document.createElement('canvas')
      tmp.width = canvas.width
      tmp.height = canvas.height
      const ctx = tmp.getContext('2d')!
      ctx.drawImage(canvas, 0, 0)
      const data = ctx.getImageData(0, 0, tmp.width, tmp.height).data
      let s = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // luminance
        s += 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      return s
    })
  }

  // Small cell size
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__neonSetPartial?.({ cellSize: 1 })
  })
  await page.waitForTimeout(800)
  const small = await getBrightness()

  // Large cell size
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__neonSetPartial?.({ cellSize: 10 })
  })
  await page.waitForTimeout(1200)
  const large = await getBrightness()

  // Expect visible change; large should yield more overall brightness coverage in typical camera setup
  expect(large).toBeGreaterThan(small * 1.05)
})