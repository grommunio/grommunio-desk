// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'
import merge from 'webpack-merge'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import path from 'node:path'

import { baseConfig } from './webpack.base.config'

export const preloadConfig: Configuration = merge(baseConfig, {
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
            configFile: path.resolve(__dirname, './tsconfig.preload.json'),
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  plugins: [
    // TODO: Bug: three instances of this plugin are created (because of the
    //            three renderer entry points) and therefore every error
    //            message is printed out three times
    new ForkTsCheckerWebpackPlugin({
      logger: undefined,
      typescript: {
        configFile: path.resolve(__dirname, './tsconfig.preload.json'),
      },
    }),
  ],
})
