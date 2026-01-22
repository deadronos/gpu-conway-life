// Simulation shaders are shared with the reusable `src/neon-sim/*` module.
export { simFrag, simVert } from '../neon-sim/simShaders'

export const cityVert = /* glsl */ `
precision highp float;

in vec3 position;
in vec3 normal;
in mat4 instanceMatrix;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D uState;
uniform float uGridSize;
uniform float uHeightScale;

out float vAge;
out float vAlive;
out vec3 vNormal;

vec2 instanceUv(float id, float size) {
  float x = mod(id, size);
  float y = floor(id / size);
  return (vec2(x, y) + 0.5) / size;
}

void main() {
  float id = float(gl_InstanceID);
  vec2 uv = instanceUv(id, uGridSize);
  vec4 s = texture(uState, uv);
  vAlive = step(0.5, s.r);
  vAge = s.a;

  // Use a power curve for height so buildings "settle" faster from their peak height
  float hFactor = pow(vAge, 1.5);
  float h = mix(0.1, uHeightScale, hFactor) * vAlive;
  vec3 p = position;
  p.y *= h;
  if (vAlive < 0.5) {
    p *= 0.0;
  }

  mat4 im = instanceMatrix;
  vec4 worldPos = im * vec4(p, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * worldPos;

  vNormal = mat3(im) * normal;
}
`

export const cityFrag = /* glsl */ `
precision highp float;

in float vAge;
in float vAlive;
in vec3 vNormal;
out vec4 fragColor;

uniform float uEmissiveGain;

vec3 ramp(float t) {
  vec3 hot = vec3(0.7, 1.0, 1.0);     // Birth: Cyan-White
  vec3 mid = vec3(1.0, 0.2, 0.6);     // Midlife: Magenta-Pink
  vec3 old = vec3(0.4, 0.03, 0.03);   // Old Age: Deep Dark Red

  // Linear mix is often smoother for color ramps than smoothstep segments
  // when combined with an external bias (pow).
  float a = clamp(t * 2.0, 0.0, 1.0);
  float b = clamp(t * 2.0 - 1.0, 0.0, 1.0);
  vec3 c1 = mix(old, mid, a);
  return mix(c1, hot, b);
}

void main() {
  if (vAlive < 0.5) {
    discard;
  }

  vec3 n = normalize(vNormal);
  float ndl = clamp(dot(n, normalize(vec3(0.3, 1.0, 0.2))), 0.0, 1.0);

  // Apply power curve to age (t) for color mapping and intensity.
  // This helps avoid the "cyan plateau" and spends more time in red/dim states.
  float t = pow(vAge, 1.5);
  vec3 base = ramp(t);

  // Dim the base lighting for older buildings
  float ambient = mix(0.05, 0.15, t);
  // Reduce glow intensity significantly as buildings age
  float glow = mix(0.02, 1.0, t);
  vec3 color = base * (ambient + 0.85 * ndl) + base * (uEmissiveGain * glow);

  fragColor = vec4(color, 1.0);
}
`
