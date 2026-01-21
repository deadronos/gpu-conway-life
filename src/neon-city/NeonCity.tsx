import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { cityFrag, cityVert } from './shaders'
import { useNeonCityStore } from './store'

type NeonCityProps = {
  gridSize: number
  stateTexture: THREE.Texture
  cellSize?: number
}

export function NeonCity({ gridSize, stateTexture, cellSize = 1.0 }: NeonCityProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const emissiveGain = useNeonCityStore((s) => s.emissiveGain)
  const heightScale = useNeonCityStore((s) => s.heightScale)

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(0.98 * cellSize, 1.0, 0.98 * cellSize)
    g.translate(0, 0.5, 0)
    return g
  }, [cellSize])

  const material = useMemo(() => {
    return new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: cityVert,
      fragmentShader: cityFrag,
      uniforms: {
        uState: { value: stateTexture },
        uGridSize: { value: gridSize },
        uHeightScale: { value: 3.0 },
        uEmissiveGain: { value: 5.0 },
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize])

  useEffect(() => {
    material.uniforms.uState.value = stateTexture
  }, [material, stateTexture])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const dummy = new THREE.Object3D()
    const half = (gridSize - 1) * cellSize * 0.5
    let i = 0
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        dummy.position.set(x * cellSize - half, 0, y * cellSize - half)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        i++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [cellSize, gridSize])

  useFrame(() => {
    material.uniforms.uState.value = stateTexture
    material.uniforms.uEmissiveGain.value = emissiveGain
    material.uniforms.uHeightScale.value = heightScale
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, gridSize * gridSize]} />
  )
}
