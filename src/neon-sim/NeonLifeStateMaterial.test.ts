import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createNeonLifeStateMaterial } from './NeonLifeStateMaterial'

describe('createNeonLifeStateMaterial', () => {
  it('creates a ShaderMaterial with expected uniforms', () => {
    const tex = new THREE.Texture()
    const mat = createNeonLifeStateMaterial({ stateTexture: tex, flipY: true })

    expect(mat).toBeInstanceOf(THREE.ShaderMaterial)
    expect(mat.uniforms).toHaveProperty('uState')
    expect(mat.uniforms).toHaveProperty('uFlipY')
    expect(mat.uniforms).toHaveProperty('uAgePower')

    expect(mat.uniforms.uState.value).toBe(tex)
    expect(mat.uniforms.uFlipY.value).toBe(1.0)
  })
})
