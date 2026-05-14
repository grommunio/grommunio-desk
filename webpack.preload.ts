// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'
import merge from 'webpack-merge'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

import { baseConfig } from './webpack.base.config'

export const preloadConfig: Configuration = merge(baseConfig, {
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
        configFile: './src/preload/tsconfig.json',
      },
    }),
  ],
})
