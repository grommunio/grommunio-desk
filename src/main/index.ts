// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { app, BrowserWindow } from 'electron'

import MainWindow from './windows/main'
import store from './utils/store'
import { getExtraResourcesPath } from './utils/utils'
import Logger from '@utils/logger'

const logger = new Logger('main/index')

const isProduction = process.env.NODE_ENV === 'production'
logger.verbose('isProduction', `Production: ${isProduction}`)

let mainWindow: MainWindow | undefined

app.on('ready', () => {
  app.setAboutPanelOptions({
    applicationName: app.getName(),
    applicationVersion: app.getVersion(),
    copyright: `Copyright (c) 2020-${new Date().getFullYear()} grommunio GmbH. All Rights Reserved.`,
    version: app.getVersion(),
    credits: 'grommunio GmbH',
    website: 'https://grommunio.com',
    iconPath: getExtraResourcesPath('app_icon.png'),
  })

  const server = store.get('server')
  mainWindow = new MainWindow(isProduction, server)
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
