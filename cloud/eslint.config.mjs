import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'uploads/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      // Nothing outside config/env.ts may read process.env.
      'no-restricted-properties': ['error', { object: 'process', property: 'env', message: 'Read configuration from @/config/env' }],
    },
  },
  { files: ['src/config/env.ts', 'tests/**', 'vitest.config.mts', 'src/scripts/**'], rules: { 'no-restricted-properties': 'off' } },
);
