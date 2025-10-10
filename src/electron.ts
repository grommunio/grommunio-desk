// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { app, BrowserWindow } from 'electron'

const isProduction = process.env.NODE_ENV === 'production'

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // TODO: research about security
      contextIsolation: false,
    },
  })

  if (isProduction)
    win.loadFile('index.html')
  else {
    win.loadURL('http://localhost:8080/')
    win.webContents.openDevTools()
  }

  console.log('Production:', isProduction)
}
app.on('ready', createWindow)

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
    createWindow()
  }
})
