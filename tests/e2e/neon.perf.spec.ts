import { test, expect } from '@playwright/test'

// Perf target for gridSize = 320 (102,400 instances)
const PERF_TARGET_FPS = 30
const MEASURE_DURATION_MS = 4000

test('perf: average FPS at gridSize=320 remains >= target', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas').first()
  await canvas.waitFor({ state: 'attached', timeout: 30000 })

  // If the demo reports that float render targets are unsupported, skip (pass)
    const unsupported =
      (await page.locator('[data-testid="unsupported"]').count()) > 0 ||
      (await page.locator('[data-testid="unsupportedOverlay"]').count()) > 0
    if (unsupported) {
    console.warn('Skipping perf test: float render targets not supported in this environment')
    return
  }

  // Ensure simulation is running at a reasonable tick rate
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__neonSetPartial?.({ paused: false, ticksPerSecond: 30 })
  })

  // warm up
  await page.waitForTimeout(1000)

  // Measure via requestAnimationFrame sampling for a fixed duration in page context
  const metrics = (await page.evaluate(async (duration: number) => {
    return new Promise<{ avg: number; min: number; samples: number }>((resolve) => {
      const samples: number[] = []
      const start = performance.now()
      let last = start
      function step(now: number) {
        samples.push(now - last)
        last = now
        if (now - start >= duration) {
          const dt = samples.slice(1) // drop first noisy sample
          const fps = dt.map((d) => 1000 / d).filter((v) => Number.isFinite(v) && v < 1000)
          const avg = fps.reduce((s, v) => s + v, 0) / fps.length
          const min = Math.min(...fps)
          resolve({ avg, min, samples: fps.length })
          return
        }
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  }, MEASURE_DURATION_MS)) as { avg: number; min: number; samples: number }

  console.log('Perf metrics:', metrics)

  expect(metrics.avg).toBeGreaterThanOrEqual(PERF_TARGET_FPS)
})