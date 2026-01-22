import type * as THREE from 'three';

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

export function detectFloatRTSupport(gl: THREE.WebGLRenderer): boolean {
  const ctx = gl.getContext();
  if (!ctx || typeof (ctx as WebGLRenderingContext).getExtension !== 'function') return false;
  return !!(ctx as WebGLRenderingContext).getExtension('EXT_color_buffer_float');
}
