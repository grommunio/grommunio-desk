// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'

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
            // disable type checking when building and use fork-ts-checker-webpack-plugin instead, because
            // ts-loader can not recheck types when hot-reloading
            transpileOnly: true,
          },
        },
      },
    ],
  },
}
