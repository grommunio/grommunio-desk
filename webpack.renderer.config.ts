// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'
import merge from 'webpack-merge'
import CopyPlugin from 'copy-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

import { baseConfig } from './webpack.base.config'

export const rendererConfig: Configuration = merge(baseConfig, {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:10]',
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.css'],
    alias: {
      '@utils': '/src/renderer/utils/',
    },
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      logger: undefined, // necesarry, otherwise logs are not routed from webpack-dev-server to terminal
      typescript: {
        configFile: './src/renderer/tsconfig.json',
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets/general/dark_background.jpg', to: 'dark_background.jpg' },
        { from: 'assets/general/logo_with_text.png', to: 'logo_with_text.png' },
      ],
    }),
  ],
})
