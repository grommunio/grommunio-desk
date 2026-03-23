// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { Configuration } from 'webpack'
import merge from 'webpack-merge'
import CopyPlugin from 'copy-webpack-plugin'

import { baseConfig } from './webpack.base.config'

export const mainConfig: Configuration = merge(baseConfig, {
  entry: './src/main/index.ts',
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@utils': '/src/main/utils/',
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets/general/icons/icon_512x512.png', to: 'icon_512x512.png' }, // about-panel icon
        { from: 'assets/windows/favicon_256x256_all.ico', to: 'favicon_256x256_all.ico' }, // win trayicon
        { from: 'assets/general/favicons/favicon_32x32.png', to: 'favicon_32x32.png' }, // linux trayicon
        { from: './assets/general/favicons/favicon_16x16.png', to: 'favicon_16x16.png' }, // mac trayicon
        { from: './assets/os_icons/app_icon.png', to: 'app_icon.png' }, // linux icon
      ],
    }),
  ],
})
