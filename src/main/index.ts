// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { app } from 'electron'

import MainWindow from './mainWindow'
import { getExtraResourcesPath } from './utils/paths'
import Logger from '@utils/logger'
import registerIpcFunctions from './intercom'
import { IS_PRODUCTION } from '../constants/misc'
import { APP_ID, APP_PRODUCT_NAME } from './constants/app'
import TrayMenu from './trayMenu'
import { systemPlatform } from './constants/system'

const logger = new Logger('main/index')

logger.verbose('isProduction', `Production: ${IS_PRODUCTION}`)

let mainWindow: MainWindow | undefined

const createWindow = (): void => {
  if (mainWindow == null)
    mainWindow = new MainWindow()
  else
    mainWindow.createWindow()
  mainWindow.show()
}

const onOpenAppClick = (): void => {
  if (mainWindow?.isWindowDefined())
    mainWindow.focus()
  else
    createWindow()
}

app.on('ready', () => {
  if (!app.requestSingleInstanceLock()) {
    app.quit()
    return
  }

  registerIpcFunctions()

  if (systemPlatform === 'win')
    app.setAppUserModelId(APP_ID)

  app.setAboutPanelOptions({
    applicationName: APP_PRODUCT_NAME,
    applicationVersion: app.getVersion(),
    copyright: `Copyright (c) 2020-${new Date().getFullYear()} grommunio GmbH. All Rights Reserved.`,
    version: app.getVersion(),
    credits: 'grommunio GmbH',
    website: 'https://grommunio.com',
    iconPath: getExtraResourcesPath('icon_512x512.png'),
  })

  createWindow()

  new TrayMenu(onOpenAppClick)
})

app.on('window-all-closed', () => {
  // stay active in background
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no
  // other windows open.
  if (!mainWindow?.isWindowDefined()) {
    createWindow()
  }
})

app.on('second-instance', () => {
  onOpenAppClick()
})
