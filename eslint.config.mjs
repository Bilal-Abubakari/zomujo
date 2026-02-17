import eslintJs from '@eslint/js';
import nextPlugin from 'eslint-config-next';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'out/**',
    'build/**',
    'dist/**',
    '.cache/**',
    'public/**',
    '**/*.config.js',
    '**/*.config.mjs',
    '**/*.config.ts',
    '.eslintrc.js',
    '.prettierrc.js',
    'postcss.config.mjs',
    'jest.config.ts',
    'tailwind.config.js',
  ]),
  eslintJs.configs.recommended,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/incompatible-library': 'off',
      'arrow-body-style': 'error',
      curly: 'error',
      'no-else-return': 'error',
      'no-useless-return': 'error',
      'no-useless-catch': 'error',
      'no-unreachable': 'error',
      'no-duplicate-imports': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['error'],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*Slice.ts', '**/*Thunk.ts', '**/store.ts'],
    rules: {
      'import/no-cycle': 'off',
    },
  },
]);

export default eslintConfig;
