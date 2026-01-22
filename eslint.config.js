import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    'dist',
    '**/.agent/**',
    '**/.agents/**',
    '**/.codex/**',
    '**/.gemini/**',
    '**/.opencode/**',
    '**/.github/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      // This repo intentionally mutates Three.js materials/uniforms in the render loop.
      // The new react-hooks lint rules flag these as violations, but they're expected here.
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
