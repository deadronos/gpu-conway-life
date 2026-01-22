import { describe, expect, it, beforeEach } from 'vitest';
import { shouldForceUnsupported } from './capabilities';

describe('shouldForceUnsupported', () => {
  beforeEach(() => {
    // Reset URL between tests
    window.history.replaceState({}, '', '/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).__neonForceUnsupported;
  });

  it('returns true when ?forceUnsupported=1 is present', () => {
    window.history.replaceState({}, '', '/?forceUnsupported=1');
    expect(shouldForceUnsupported()).toBe(true);
  });

  it('returns true when window flag is set', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__neonForceUnsupported = true;
    expect(shouldForceUnsupported()).toBe(true);
  });

  it('returns false by default', () => {
    expect(shouldForceUnsupported()).toBe(false);
  });
});
