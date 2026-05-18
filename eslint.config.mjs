// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import licenseHeader from 'eslint-plugin-license-header'

// TODO: use no-restricted-imports to forbid some imports (e.g. src/types/dialog/... except index.ts)
const sharedRules = {
  'license-header/header': ['error', './resources/license-header.js'],
  'stylistic/jsx-self-closing-comp': ['error', { component: true, html: true }],
  'stylistic/jsx-props-no-multi-spaces': 'error',
  'stylistic/jsx-curly-spacing': ['error', { when: 'never', children: true }],
}

export default defineConfig(
  eslint.configs.recommended,
  globalIgnores([
    'resources/',
    '.webpack/',
    'dist/',
    'node_modules/',
  ]),
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'typescript-eslint': tseslint,
      'stylistic': stylistic,
      'license-header': licenseHeader,
    },
    extends: [
      'typescript-eslint/strict',
      'typescript-eslint/stylistic',
      'stylistic/recommended',
    ],
    rules: {
      ...sharedRules,
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'],
    plugins: {
      'stylistic': stylistic,
      'license-header': licenseHeader,
    },
    extends: [
      'stylistic/recommended',
    ],
    rules: {
      ...sharedRules,
    },
  },
)
