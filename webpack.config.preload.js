// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const {merge} = require('webpack-merge')

const {baseConfig, outputPath} = require('./webpack.config.base')

module.exports = merge(baseConfig,
  {
    entry: './src/main/preload.ts',
    target: 'electron-preload',
    output: {
      path: outputPath,
      filename: 'preload.js',
    },
  }
)