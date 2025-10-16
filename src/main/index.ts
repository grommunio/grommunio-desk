// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './windows/mainWindow'

const isProduction = process.env.NODE_ENV === 'production'

console.log('Production:', isProduction)

app.on('ready', () => createMainWindow(isProduction))

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their
  // menu bar to stay active until the user quits
  // explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the
  // app when the dock icon is clicked and there are no
  // other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow(isProduction)
  }
})
