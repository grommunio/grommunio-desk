// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

const {merge} = require('webpack-merge')
const CopyPlugin = require("copy-webpack-plugin");

const {baseConfig, outputPath} = require('./webpack.config.base')

// TODO: use eslint in webpack files (?)
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
          { from: 'assets/general/icons/icon_512x512.png', to: 'icon_512x512.png' }, // about-window icon
          { from: 'assets/windows/icon_256x256_all.ico', to: 'icon.ico' }, // windows icon // TODO: necessary?
          { from: 'assets/windows/favicon_256x256_all.ico', to: 'favicon.ico' }, // win trayicon
          { from: 'assets/general/favicons/favicon_32x32.png', to: 'favicon_32x32@2x.png' }, // mac trayicon
          { from: 'assets/general/favicons/favicon_32x32.png', to: 'favicon_32x32.png' }, // linux trayicon
        ],
      }),
    ],
  }
)
