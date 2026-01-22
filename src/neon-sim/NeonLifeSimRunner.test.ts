import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { createNeonLifeSimRunner } from './NeonLifeSimRunner'

describe('createNeonLifeSimRunner', () => {
  it('creates a runner that exposes a texture', () => {
    const gl = {
      setRenderTarget: vi.fn(),
      render: vi.fn(),
    } as unknown as THREE.WebGLRenderer

    const runner = createNeonLifeSimRunner(gl, { gridSize: 8, initialState: 'clear', initialSeed: 1 })

    expect(runner.gridSize).toBe(8)
    expect(runner.texture).toBeInstanceOf(THREE.Texture)

    runner.dispose()
  })

  it('steps and toggles output texture reference over time', () => {
    const gl = {
      setRenderTarget: vi.fn(),
      render: vi.fn(),
    } as unknown as THREE.WebGLRenderer

    const runner = createNeonLifeSimRunner(gl, { gridSize: 8, initialState: 'random', initialSeed: 123 })
    runner.setParams({ ticksPerSecond: 10, stepsPerTick: 1 })

    const t0 = runner.texture
    // step enough time to trigger at least one tick
    runner.step(0.2)
    const t1 = runner.texture

    expect(gl.render).toHaveBeenCalled()
    expect(t1).not.toBeNull()
    // Depending on accumulator, texture may or may not have swapped, but after a reset it must.
    runner.reset('clear')
    const t2 = runner.texture
    expect(t2).toBeInstanceOf(THREE.Texture)
    expect(t2).not.toBe(t0)

    runner.dispose()
  })
})
