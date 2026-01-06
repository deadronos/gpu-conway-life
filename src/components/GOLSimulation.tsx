import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { simulationFragmentShader, simulationVertexShader } from '../shaders/SimulationShader';
import { displayFragmentShader, displayVertexShader } from '../shaders/DisplayShader';

const GOLSimulation = () => {
  const { gl, size } = useThree();

  const width = size.width;
  const height = size.height;

  // Create two FBOs for ping-pong
  const sceneRenderTarget = useFBO(width, height, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const sceneRenderTarget2 = useFBO(width, height, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  // Refs to keep track of ping-pong
  const currentRenderTarget = useRef(sceneRenderTarget);
  const nextRenderTarget = useRef(sceneRenderTarget2);

  // Update refs when FBOs change (e.g. on resize)
  useEffect(() => {
    currentRenderTarget.current = sceneRenderTarget;
    nextRenderTarget.current = sceneRenderTarget2;
    // Reset simulation on resize
    firstFrame.current = true;
  }, [sceneRenderTarget, sceneRenderTarget2]);

  // Camera for the simulation pass
  const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const scene = useMemo(() => new THREE.Scene(), []);

  // Initial Data Texture
  const initialTexture = useMemo(() => {
    const data = new Float32Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      // eslint-disable-next-line react-hooks/purity
      const val = Math.random() > 0.5 ? 1.0 : 0.0;
      data[i * 4] = val; // R
      data[i * 4 + 1] = 0.0;
      data[i * 4 + 2] = 0.0;
      data[i * 4 + 3] = 1.0;
    }
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
  }, [width, height]);

  // Simulation Material
  const simMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: initialTexture },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
    });
  }, [width, height, initialTexture]);

  // Display Material (for the visible mesh)
  const displayMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null }, // Will be updated in loop
      },
      vertexShader: displayVertexShader,
      fragmentShader: displayFragmentShader,
    });
  }, []);

  // Track if it's the first frame to handle initialization
  const firstFrame = useRef(true);

  useFrame(() => {
    // 1. Simulation Step

    if (firstFrame.current) {
      // eslint-disable-next-line react-hooks/immutability
      simMaterial.uniforms.uTexture.value = initialTexture;
      firstFrame.current = false;
    } else {
      // eslint-disable-next-line react-hooks/immutability
      simMaterial.uniforms.uTexture.value = currentRenderTarget.current.texture;
    }

    // Render to the next buffer
    gl.setRenderTarget(nextRenderTarget.current);
    gl.render(scene, camera);
    gl.setRenderTarget(null); // Reset to default framebuffer

    // 2. Display Step
    // Update the display material to show the newly computed state
    // eslint-disable-next-line react-hooks/immutability
    displayMaterial.uniforms.uTexture.value = nextRenderTarget.current.texture;

    // 3. Swap buffers
    const temp = currentRenderTarget.current;
    currentRenderTarget.current = nextRenderTarget.current;
    nextRenderTarget.current = temp;
  });

  return (
    <>
      {createPortal(
        <mesh material={simMaterial}>
          <planeGeometry args={[2, 2]} />
        </mesh>,
        scene
      )}
      <mesh material={displayMaterial}>
        <planeGeometry args={[size.width, size.height]} />
      </mesh>
    </>
  );
};

export default GOLSimulation;
