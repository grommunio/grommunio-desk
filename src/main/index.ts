// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { app, BrowserWindow } from 'electron'

import MainWindow from './mainWindow'
import { getExtraResourcesPath } from './utils/paths'
import Logger from '@utils/logger'
import registerIpcFunctions from './intercom'
import { IS_PRODUCTION } from '../constants/misc'

const logger = new Logger('main/index')

logger.verbose('isProduction', `Production: ${IS_PRODUCTION}`)

let mainWindow: MainWindow | undefined

app.on('ready', () => {
  registerIpcFunctions()

  app.setAboutPanelOptions({
    applicationName: 'grommunio Desk',
    applicationVersion: app.getVersion(),
    copyright: `Copyright (c) 2020-${new Date().getFullYear()} grommunio GmbH. All Rights Reserved.`,
    version: app.getVersion(),
    credits: 'grommunio GmbH',
    website: 'https://grommunio.com',
    iconPath: getExtraResourcesPath('app_icon.png'),
  })

  mainWindow = new MainWindow()
  mainWindow.show()
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no
  // other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow?.createWindow()
  }
})
