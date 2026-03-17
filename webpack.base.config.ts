// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

export const baseConfig: Configuration = {
  module: {
    rules: [
      {
        test: /native_modules[/\\].+\.node$/,
        use: 'node-loader',
      },
      {
        test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: '@vercel/webpack-asset-relocator-loader',
          options: {
            outputAssetBase: 'native_modules',
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      logger: 'webpack-infrastructure',
    }),
  ],
}
