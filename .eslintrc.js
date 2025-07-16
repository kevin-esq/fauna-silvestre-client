/* eslint-disable @typescript-eslint/no-require-imports */
const globals = require('globals');
const tseslint = require('typescript-eslint');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.node,
    },
    plugins: {
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
    },
    extends: [
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      tseslint.configs.recommended,
    ],
    rules: {
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
]);
/* eslint-enable @typescript-eslint/no-require-imports */
