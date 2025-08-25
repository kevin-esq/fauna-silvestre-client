/* eslint-disable @typescript-eslint/no-require-imports */
const globals = require('globals');
const tseslint = require('typescript-eslint');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: [
      'node_modules',
      'build',
      'coverage',
      'android',
      'ios',
      'build',
      'dist',
      'coverage'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: globals.node
    },
    plugins: {
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      prettier: require('eslint-plugin-prettier')
    },
    extends: [
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      tseslint.configs.recommended,
      'plugin:prettier/recommended'
    ],
    rules: {
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'prettier/prettier': 'error'
    },
    settings: {
      react: { version: 'detect' }
    }
  }
]);
