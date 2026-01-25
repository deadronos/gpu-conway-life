import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as THREE from 'three'
import React from 'react'

// Mock the parts of R3F we need
vi.mock('@react-three/fiber', async () => {
  const React = await import('react')
  const camera = { position: { set: vi.fn() }, near: 0.1, far: 2000, updateProjectionMatrix: vi.fn() }
  return {
    Canvas: ({ children }: { children: React.ReactNode }) => {
      const filtered = React.Children.toArray(children).filter(c => {
        if (!React.isValidElement(c)) return false
        return typeof c.type !== 'string'
      })
      return <div data-testid="canvas">{filtered}</div>
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useThree: (selector?: any) => {
      const state = { camera, gl: { setRenderTarget: vi.fn(), render: vi.fn(), domElement: {} } }
      return typeof selector === 'function' ? selector(state) : state
    },
    useFrame: (fn: unknown) => {
      // Reference the unused param to avoid TypeScript "unused parameter" errors in tests
      void fn
      // no-op for tests; we trigger resets via props instead
      return undefined
    },
  }
})

vi.mock('leva', () => ({ useControls: () => undefined, folder: (v: unknown) => v }))

// We will swap in a fake runner instance per-test.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fakeRunner: any = null
vi.mock('./NeonLifeSimRunner', async () => {
  return {
    createNeonLifeSimRunner: () => fakeRunner,
  }
})

import { NeonLifeSimPass } from './NeonLifeSimPass'

describe('NeonLifeSimPass', () => {
  beforeEach(() => {
    fakeRunner = {
      gridSize: 8,
      texture: new THREE.Texture(),
      setParams: vi.fn(),
      setBrush: vi.fn(),
      step: vi.fn().mockReturnValue(new THREE.Texture()),
      reset: vi.fn(),
      dispose: vi.fn(),
    }
  })

  it('calls onTexture with initial texture on mount', () => {
    const onTexture = vi.fn()

    render(
      <div>
        <NeonLifeSimPass gridSize={8} onTexture={onTexture} />
      </div>,
    )

    // initial mount effect should call onTexture with runner.texture
    expect(onTexture).toHaveBeenCalled()
    expect(onTexture.mock.calls[0][0]).toBe(fakeRunner.texture)
  })

  it('calls onTexture after reset nonce changes', async () => {
    const onTexture = vi.fn()

    // Make reset mutate the runner.texture to a new object when called.
    const newTex = new THREE.Texture()
    fakeRunner.reset = vi.fn(() => {
      fakeRunner.texture = newTex
    })

    const { rerender } = render(
      <div>
        <NeonLifeSimPass gridSize={8} onTexture={onTexture} />
      </div>,
    )

    // on first mount called with initial texture
    expect(onTexture).toHaveBeenCalledTimes(1)

    // bump the nonce to trigger reset effect
    rerender(
      <div>
        <NeonLifeSimPass gridSize={8} resetNonce={1} resetMode="random" onTexture={onTexture} />
      </div>,
    )

    // after reset, onTexture should be called again with the updated texture
    expect(fakeRunner.reset).toHaveBeenCalled()
    // the effect performs runner.reset then calls onTexture with the runner.texture
    expect(onTexture).toHaveBeenCalled()
    const lastCall = onTexture.mock.calls[onTexture.mock.calls.length - 1]
    expect(lastCall[0]).toBe(newTex)
  })

  it('disposes the runner on unmount', () => {
    const onTexture = vi.fn()

    const { unmount } = render(
      <div>
        <NeonLifeSimPass gridSize={8} onTexture={onTexture} />
      </div>,
    )

    unmount()

    expect(fakeRunner.dispose).toHaveBeenCalled()
  })
})
