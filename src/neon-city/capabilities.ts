import * as THREE from 'three'

// Test hook: allow Playwright (or developers) to force the unsupported path.
// Safe for prod: does nothing unless explicitly opted-in.
export function shouldForceUnsupported(): boolean {
  if (typeof window === 'undefined') return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).__neonForceUnsupported === true) return true;

  try {
    const v = new URLSearchParams(window.location?.search ?? '').get('forceUnsupported');
    return v === '1' || v === 'true';
  } catch {
    return false;
  }
}

// Test hook: allow Playwright (or developers) to force the runtime-error overlay.
// Safe for prod: does nothing unless explicitly opted-in.
export function shouldForceError(): boolean {
  if (typeof window === 'undefined') return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).__neonForceError === true) return true;

  try {
    const v = new URLSearchParams(window.location?.search ?? '').get('forceError');
    return v === '1' || v === 'true';
  } catch {
    return false;
  }
}

export function detectFloatRTSupport(gl: THREE.WebGLRenderer): boolean {
  const ctx = gl.getContext();
  if (!ctx || typeof (ctx as WebGLRenderingContext).getExtension !== 'function') return false;

  // Fast path: extension presence.
  const extOk = !!(ctx as WebGLRenderingContext).getExtension('EXT_color_buffer_float')
  if (!extOk) return false

  // Robust path: actually render into a float RT and read back a pixel.
  // Some headless/virtualized environments can report the extension but still fail at runtime.
  try {
    const rt = new THREE.WebGLRenderTarget(2, 2, {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
    })

    const scene = new THREE.Scene()
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0, 0) })
    const quad = new THREE.Mesh(geo, mat)
    scene.add(quad)

    gl.setRenderTarget(rt)
    gl.clear()
    gl.render(scene, cam)

    const pixels = new Float32Array(2 * 2 * 4)
    gl.readRenderTargetPixels(rt, 0, 0, 2, 2, pixels)
    gl.setRenderTarget(null)

    geo.dispose()
    mat.dispose()
    rt.dispose()

    // Expect red channel to be non-zero.
    return pixels[0] > 0.25
  } catch {
    return false
  }
}
