export const simVert = /* glsl */ `
in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

// RGBA state: R = alive (0/1), A = age (0..1). G/B unused.
export const simFrag = /* glsl */ `
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPrev;
uniform vec2 uTexSize;
uniform float uAgeDecay;
uniform int uWrap;

uniform int uResetMode; // 0 = none, 1 = clear, 2 = random
uniform float uResetSeed;

uniform int uBrushDown;
uniform vec2 uBrushUv;
uniform float uBrushRadiusPx;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec4 sampleState(ivec2 coord) {
  ivec2 sizeI = ivec2(uTexSize);
  if (uWrap == 1) {
    coord = ivec2((coord.x % sizeI.x + sizeI.x) % sizeI.x, (coord.y % sizeI.y + sizeI.y) % sizeI.y);
  }
  else {
    if (coord.x < 0 || coord.y < 0 || coord.x >= sizeI.x || coord.y >= sizeI.y) {
      return vec4(0.0);
    }
  }
  vec2 uv = (vec2(coord) + 0.5) / uTexSize;
  return texture(uPrev, uv);
}

void main() {
  ivec2 coord = ivec2(floor(vUv * uTexSize));

  if (uResetMode == 1) {
    fragColor = vec4(0.0);
    return;
  }

  if (uResetMode == 2) {
    float r = hash12(vec2(coord) + uResetSeed);
    float alive = step(0.86, r);
    fragColor = vec4(alive, 0.0, 0.0, alive);
    return;
  }

  vec4 cur = sampleState(coord);
  float alive = step(0.5, cur.r);
  float age = cur.a;

  float n = 0.0;
  n += step(0.5, sampleState(coord + ivec2(-1, -1)).r);
  n += step(0.5, sampleState(coord + ivec2( 0, -1)).r);
  n += step(0.5, sampleState(coord + ivec2( 1, -1)).r);
  n += step(0.5, sampleState(coord + ivec2(-1,  0)).r);
  n += step(0.5, sampleState(coord + ivec2( 1,  0)).r);
  n += step(0.5, sampleState(coord + ivec2(-1,  1)).r);
  n += step(0.5, sampleState(coord + ivec2( 0,  1)).r);
  n += step(0.5, sampleState(coord + ivec2( 1,  1)).r);

  float survive = alive * step(1.5, n) * step(n, 3.5);
  float born = (1.0 - alive) * step(2.5, n) * step(n, 3.5);
  float nextAlive = clamp(survive + born, 0.0, 1.0);

  float nextAge = 0.0;
  if (nextAlive > 0.5) {
    nextAge = born > 0.5 ? 1.0 : max(age - uAgeDecay, 0.0);
  }

  // Brush (forces life + max age)
  if (uBrushDown == 1) {
    vec2 px = vUv * uTexSize;
    vec2 bpx = uBrushUv * uTexSize;
    float d = distance(px, bpx);
    if (d <= uBrushRadiusPx) {
      nextAlive = 1.0;
      nextAge = 1.0;
    }
  }

  fragColor = vec4(nextAlive, 0.0, 0.0, nextAge);
}
`

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
