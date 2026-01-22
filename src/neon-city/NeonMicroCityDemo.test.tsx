import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { useNeonCityStore } from './store';

vi.mock('@react-three/fiber', async () => {
  const React = await import('react');

  const camera = {
    position: { set: vi.fn() },
    near: 0.1,
    far: 2000,
    updateProjectionMatrix: vi.fn(),
  };

  return {
    Canvas: ({ children }: { children: ReactNode }) => {
      const filtered = React.Children.toArray(children).filter(c => {
        if (!React.isValidElement(c)) return false;
        return typeof c.type !== 'string';
      });
      return <div data-testid="canvas">{filtered}</div>;
    },

    // Minimal mock for components that call `useThree((s) => s.camera)`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useThree: (selector?: any) => {
      const state = { camera };
      return typeof selector === 'function' ? selector(state) : state;
    },
  };
});

vi.mock('@react-three/drei', async () => {
  await import('react');
  return {
    OrbitControls: () => <div data-testid="orbitControls" />,
    Stats: () => <div data-testid="stats" />,
  };
});

vi.mock('@react-three/postprocessing', async () => {
  await import('react');
  return {
    EffectComposer: ({ children }: { children: ReactNode }) => (
      <div data-testid="composer">{children}</div>
    ),
    Bloom: () => <div data-testid="bloom" />,
  };
});

vi.mock('leva', () => ({
  useControls: () => undefined,
  folder: (v: unknown) => v,
  button: (fn: unknown) => fn,
}));

vi.mock('./NeonCity', async () => {
  await import('react');
  return {
    NeonCity: () => <div data-testid="neonCity" />,
  };
});

vi.mock('./Hud', async () => {
  await import('react');
  return {
    Hud: () => <div data-testid="hud" />,
  };
});

vi.mock('./NeonLifeSim', async () => {
  await import('react');
  return {
    NeonLifeSim: () => <div data-testid="neonLifeSim" />,
  };
});

import { NeonMicroCityDemo } from './NeonMicroCityDemo';

describe('NeonMicroCityDemo', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    useNeonCityStore.setState({ floatRTSupported: true, paused: false });
  });

  it('does not mount NeonLifeSim when forced unsupported (even if store defaults supported)', () => {
    window.history.replaceState({}, '', '/?forceUnsupported=1');

    render(<NeonMicroCityDemo />);

    expect(screen.getByTestId('unsupportedOverlay')).toBeInTheDocument();
    expect(screen.queryByTestId('neonLifeSim')).not.toBeInTheDocument();
  });

  it('shows fallback overlay when float RT is not supported (without forcing)', () => {
    useNeonCityStore.setState({ floatRTSupported: false, paused: true });

    render(<NeonMicroCityDemo />);

    expect(screen.getByTestId('unsupportedOverlay')).toBeInTheDocument();
    expect(screen.queryByTestId('neonLifeSim')).not.toBeInTheDocument();
  });

  it('mounts NeonLifeSim when float RT is supported and not forced unsupported', () => {
    render(<NeonMicroCityDemo />);

    expect(screen.queryByTestId('unsupportedOverlay')).not.toBeInTheDocument();
    expect(screen.getByTestId('neonLifeSim')).toBeInTheDocument();
  });
});
