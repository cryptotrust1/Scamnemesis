/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Allow unused vars with underscore prefix
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    // Allow explicit any in some cases (warn instead of error)
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow empty interfaces for extension
    '@typescript-eslint/no-empty-interface': 'off',
    // React specific
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    // Next.js specific
    '@next/next/no-img-element': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    'dist/',
    'coverage/',
    'playwright-report/',
    'test-results/',
    '.turbo/',
    '*.tsbuildinfo',
  ],
  overrides: [
    // Config files
    {
      files: ['*.config.js', '*.config.ts', 'jest.setup.js'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    // E2E tests - relaxed rules
    {
      files: ['e2e/**/*.ts', 'e2e/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    // Test files
    {
      files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
