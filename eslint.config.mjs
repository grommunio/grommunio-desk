// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import licenseHeader from 'eslint-plugin-license-header'

export default defineConfig(
  eslint.configs.recommended,
  globalIgnores([
    'webpack.config.*',
    'dist/',
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
      'license-header/header': ['error', './resources/license-header.js'],
    },
  },
)
