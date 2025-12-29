// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const {merge} = require('webpack-merge')
const CopyPlugin = require("copy-webpack-plugin");

const {baseConfig, outputPath} = require('./webpack.config.base')

module.exports = merge(baseConfig,
  {
    entry: './src/main/index.ts',
    target: 'electron-main',
    output: {
      path: outputPath,
      filename: 'main.js',
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "assets/mac/icon.iconset/icon_512x512.png", to: "app_icon.png" },
        ],
      }),
    ],
  }
)
