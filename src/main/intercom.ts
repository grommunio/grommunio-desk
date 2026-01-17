// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainInvokeEvent } from 'electron'
import https from 'https'

import {
  VALIDATE_SERVER,
} from './constants/communication'

function validateServer(server: string): Promise<boolean> {
  const url = server.replace(/\/$/, '') + '/web/version' // TODO: replace necessary?

  return new Promise((resolve) => {
    try {
      const req = https.get(url, (res) => {
        res.resume()
        resolve(res.statusCode === 200)
      })

      req.on('error', () => resolve(false))
      req.setTimeout(3000, () => {
        req.destroy()
        resolve(false)
      })
    }
    catch {
      resolve(false)
    }
  })
}

export default function registerIpcFunctions(): void {
  ipcMain.handle(VALIDATE_SERVER, async (_event: IpcMainInvokeEvent, server: string) => {
    return validateServer(server)
  })
}
