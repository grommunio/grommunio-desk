// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

const {merge} = require('webpack-merge')
const CopyPlugin = require("copy-webpack-plugin");

const {baseConfig, outputPath} = require('./webpack.config.base')

module.exports = merge(baseConfig,
  {
    entry: './src/main/index.ts',
    target: 'electron-main',
    resolve: {
      alias: {
        '@utils': '/src/main/utils/',
      },
    },
    output: {
      path: outputPath,
      filename: 'main.js',
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "assets/general/icons/icon_512x512.png", to: "icon.png" },
        ],
      }),
    ],
  }
)
