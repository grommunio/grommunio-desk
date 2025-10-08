import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig(
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'typescript-eslint': tseslint,
      'stylistic': stylistic,
    },
    extends: [
      'typescript-eslint/strict',
      'typescript-eslint/stylistic',
      'stylistic/recommended',
    ],
  },
  {
    ignores: ['webpack.config.*']
  }
)
