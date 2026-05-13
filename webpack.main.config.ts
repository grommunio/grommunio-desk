// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'
import merge from 'webpack-merge'
import CopyPlugin from 'copy-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

import { baseConfig } from './webpack.base.config'
import { STATIC_RESOURCES } from './constants'

export const mainConfig: Configuration = merge(baseConfig, {
  entry: './src/main/index.ts',
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@utils': '/src/main/utils/',
    },
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      logger: 'webpack-infrastructure',
      typescript: {
        configFile: './src/main/tsconfig.json',
      },
    }),
    new CopyPlugin({
      patterns: STATIC_RESOURCES.map(path => ({ from: path, to: path.split('/').pop() })),
    }),
  ],
})
