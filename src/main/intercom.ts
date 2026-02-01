// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainInvokeEvent } from 'electron'
import https from 'https'

import {
  VALIDATE_SERVER_URL,
} from './constants/communication'

function validateServerUrl(server: string): Promise<boolean> {
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
  ipcMain.handle(VALIDATE_SERVER_URL, async (_event: IpcMainInvokeEvent, server: string) => {
    return validateServerUrl(server)
  })
}
