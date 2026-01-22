import * as THREE from 'three'

export type NeonLifeStateMaterialOptions = {
  stateTexture?: THREE.Texture | null

  // If true, sample (u, 1 - v) instead of (u, v)
  flipY?: boolean

  backgroundColor?: THREE.ColorRepresentation
  backgroundAlpha?: number

  // Applied as pow(age, agePower)
  agePower?: number

  // Global multiplier for output rgb
  gain?: number
}

const vert = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const frag = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uState;
uniform float uFlipY;
uniform vec3 uBackground;
uniform float uBackgroundAlpha;
uniform float uAgePower;
uniform float uGain;

vec3 ramp(float t) {
  vec3 hot = vec3(0.7, 1.0, 1.0);     // Birth: Cyan-White
  vec3 mid = vec3(1.0, 0.2, 0.6);     // Midlife: Magenta-Pink
  vec3 old = vec3(0.4, 0.03, 0.03);   // Old Age: Deep Dark Red

  float a = clamp(t * 2.0, 0.0, 1.0);
  float b = clamp(t * 2.0 - 1.0, 0.0, 1.0);
  vec3 c1 = mix(old, mid, a);
  return mix(c1, hot, b);
}

void main() {
  vec2 uv = vUv;
  if (uFlipY > 0.5) uv.y = 1.0 - uv.y;

  vec4 s = texture2D(uState, uv);

  float alive = step(0.5, s.r);
  float age = clamp(s.a, 0.0, 1.0);

  float t = pow(age, max(0.0001, uAgePower));
  vec3 life = ramp(t);

  vec3 color = mix(uBackground, life, alive) * uGain;
  float alpha = mix(uBackgroundAlpha, 1.0, alive);

  gl_FragColor = vec4(color, alpha);
}
`

/**
 * Mesh-agnostic shader material for visualizing the sim state texture.
 *
 * Expected state texture layout:
 * - R = alive (0/1)
 * - A = age (0..1)
 */
export function createNeonLifeStateMaterial(
  options: NeonLifeStateMaterialOptions = {},
): THREE.ShaderMaterial {
  const bg = new THREE.Color(options.backgroundColor ?? 0x050508)

  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      // Assign a 1x1 placeholder to avoid WebGL warnings before user assigns a real RT texture.
      uState: { value: options.stateTexture ?? new THREE.Texture() },
      uFlipY: { value: options.flipY ? 1.0 : 0.0 },
      uBackground: { value: bg },
      uBackgroundAlpha: { value: options.backgroundAlpha ?? 1.0 },
      uAgePower: { value: options.agePower ?? 1.5 },
      uGain: { value: options.gain ?? 1.0 },
    },
    transparent: true,
  })

  return mat
}

export type NeonLifeStateMaterial = ReturnType<typeof createNeonLifeStateMaterial>
