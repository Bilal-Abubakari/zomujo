module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['react', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'arrow-body-style': 'error',
    curly: 'error',
    'no-return-await': 'error',
    'no-else-return': 'error',
    'no-useless-return': 'error',
    'no-useless-catch': 'error',
    'no-useless-escape': 'error',
    'no-unreachable': 'error',
    'import/no-cycle': 2,
    '@typescript-eslint/explicit-function-return-type': ['error'],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
  },
  overrides: [
    { files: ['*Slice.ts', '*Thunk.ts', 'store.ts'], rules: { 'import/no-cycle': 'off' } },
  ],
};
