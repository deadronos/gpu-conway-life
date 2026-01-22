import { describe, expect, it, beforeEach } from 'vitest';
import { shouldForceError, shouldForceUnsupported } from './capabilities';

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

describe('shouldForceError', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).__neonForceError;
  });

  it('returns true when ?forceError=1 is present', () => {
    window.history.replaceState({}, '', '/?forceError=1');
    expect(shouldForceError()).toBe(true);
  });

  it('returns true when window flag is set', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__neonForceError = true;
    expect(shouldForceError()).toBe(true);
  });

  it('returns false by default', () => {
    expect(shouldForceError()).toBe(false);
  });
});
