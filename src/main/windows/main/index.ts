// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { BrowserWindow } from 'electron'

export function createMainWindow(isProduction: boolean): void {
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
}
