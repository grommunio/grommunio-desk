// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'

import MainWindow from './windows/main'
import store from './utils/store'
import { CONFIG_SAVE_SERVER } from './constants/communication'

const isProduction = process.env.NODE_ENV === 'production'
console.log('Production:', isProduction)

let mainWindow: MainWindow | undefined

app.on('ready', () => {
  ipcMain.on(CONFIG_SAVE_SERVER, (_event: IpcMainEvent, server: string) => {
    store.set('server', server)
    mainWindow?.reloadView(server)
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
