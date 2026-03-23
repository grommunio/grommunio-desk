// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerMSIX } from '@electron-forge/maker-msix'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import path from 'node:path'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [
      './assets/general/icons/icon_512x512.png', // about-panel icon
      './assets/windows/favicon_256x256_all.ico', // win trayicon
      './assets/general/favicons/favicon_32x32.png', // linux trayicon
      './assets/general/favicons/favicon_16x16.png', // mac trayicon
      './assets/os_icons/app_icon.png', // linux icon
    ],
    executableName: 'grommunio-desk',
    icon: './assets/os_icons/app_icon',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'grommunio-desk',
      setupIcon: './assets/os_icons/app_icon.ico',
      iconUrl: 'https://download.grommunio.com/desk/windows/app_icon.ico',
      windowsSign: undefined,
    }),
    new MakerMSIX({
      manifestVariables: {
        publisher: '',
        publisherDisplayName: 'grommunio GmbH',
        packageIdentity: 'com.grommunio.desk',
        appExecutable: 'grommunio-desk.exe',
        packageDisplayName: 'grommunio Desk',
        appDisplayName: 'grommunio Desk',
      },
      packageAssets: path.resolve('./assets/windows/msix_assets'),
      sign: false,
      // logLevel: 'debug',
    }),
    new MakerDeb({
      options: {
        icon: './assets/os_icons/app_icon.png',
      },
    }),
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
