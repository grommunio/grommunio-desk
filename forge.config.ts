// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [
      './assets/general/icons/icon_512x512.png', // about-panel icon
      './assets/windows/favicon_256x256_all.ico', // win trayicon
      './assets/general/favicons/favicon_32x32.png', // mac & linux trayicon
    ],
    executableName: 'grommunio-desk',
    name: 'grommunio Desk',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'grommunioDesk',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: 'default-src \'self\' \'unsafe-eval\' \'unsafe-inline\' static: http: https: ws:',
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            name: 'main_start',
            html: './src/renderer/index.html',
            js: './src/renderer/mainWindow/startView/index.tsx',
            preload: {
              js: './src/main/preload.ts',
            },
          },
          {
            name: 'main_titleBar',
            html: './src/renderer/index.html',
            js: './src/renderer/mainWindow/titleBarView/index.tsx',
            preload: {
              js: './src/main/preload.ts',
            },
          },
          {
            name: 'main_dialog',
            html: './src/renderer/index.html',
            js: './src/renderer/mainWindow/dialogView/index.tsx',
            preload: {
              js: './src/main/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config
