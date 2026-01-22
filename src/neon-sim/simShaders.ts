// Simulation shaders shared between the reusable sim runner and app demos.
// RGBA state texture layout:
// - R = alive (0/1)
// - A = age (0..1)
// - G/B unused

export const simVert = /* glsl */ `
in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

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
`;
