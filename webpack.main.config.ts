// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'
import merge from 'webpack-merge'
import CopyPlugin from 'copy-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import path from 'node:path'

import { baseConfig } from './webpack.base.config'
import { STATIC_RESOURCES } from './constants'

export const mainConfig: Configuration = merge(baseConfig, {
  entry: './src/main/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            // disable type checking when building and use fork-ts-checker-webpack-plugin instead, because
            // ts-loader can not recheck types when hot-reloading
            transpileOnly: true,
            configFile: path.resolve(__dirname, './tsconfig.main.json'),
          },
        },
      },
    ],
  },
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
        configFile: path.resolve(__dirname, './tsconfig.main.json'),
      },
    }),
    new CopyPlugin({
      patterns: STATIC_RESOURCES.map(path => ({ from: path, to: path.split('/').pop() })),
    }),
  ],
})
