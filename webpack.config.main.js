// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const {merge} = require('webpack-merge')

const {baseConfig} = require('./webpack.config.base')

module.exports = merge(baseConfig,
  {
    entry: './src/main/index.ts',
    target: 'electron-main',
    output: {
      path: __dirname + '/dist',
      filename: 'main.js',
    },
  }
)