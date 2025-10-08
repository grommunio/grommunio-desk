import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

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
    },
    extends: [
      'typescript-eslint/strict',
      'typescript-eslint/stylistic',
      'stylistic/recommended',
    ],
  },
)
