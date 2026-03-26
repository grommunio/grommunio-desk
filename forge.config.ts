// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

// TODO: add ts type checking for files in root directory (forge.config.ts, webpack.base.config.ts, ...)
import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerMSIX } from '@electron-forge/maker-msix'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import path from 'node:path'

import envConfig from './envConfig'
import { STATIC_RESOURCES } from './constants'
import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const APP_IDENTIFIER = 'com.grommunio.grommunio-desk'

const getIconPath = (ext?: 'png' | 'icns' | 'icon' | 'ico'): string => path.resolve(`./assets/os_icons/app_icon${ext == null ? '' : `.${ext}`}`)

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: STATIC_RESOURCES,
    executableName: 'grommunio-desk',
    icon: getIconPath(),
    appBundleId: APP_IDENTIFIER,
    osxSign: {
      identity: envConfig.get('APPLE_SIGNING_IDENTITY'),
    },
    osxNotarize: {
      appleId: envConfig.get('APPLE_ID'),
      appleIdPassword: envConfig.get('APPLE_PASSWORD'), // despite the name, it is not the password of the Apple ID account
      teamId: envConfig.get('APPLE_TEAM_ID'),
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'grommunio-desk',
      setupIcon: getIconPath('ico'),
      iconUrl: 'https://download.grommunio.com/desk/windows/app_icon.ico',
      windowsSign: undefined,
    }),
    new MakerMSIX({
      manifestVariables: {
        publisher: '',
        publisherDisplayName: 'grommunio GmbH',
        packageIdentity: APP_IDENTIFIER,
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
        icon: getIconPath('png'),
      },
    }),
    new MakerDMG({}),
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
