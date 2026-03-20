// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainInvokeEvent, IpcMainEvent } from 'electron'
import https from 'https'

import {
  GET_SYSTEM_PLATFORM,
  VALIDATE_SERVER_URL,
} from './constants/communication'
import { systemPlatform } from './constants/system'

async function onValidateServerUrl(_event: IpcMainInvokeEvent, server: string): Promise<boolean> {
  const MAX_VERSION_BODY_LENGTH = 4096
  const VERSION_ENDPOINT_PATH = '/web/version'
  const VERSION_REGEX = /^\d+\.\d+\.\d+\.[a-z0-9]+-(lp\d+\.|\d+\+)\d+\.\d+$/

  let parsedUrl: URL
  try {
    parsedUrl = new URL(server)
  }
  catch {
    return Promise.resolve(false)
  }
  parsedUrl.pathname += VERSION_ENDPOINT_PATH
  parsedUrl.search = ''
  parsedUrl.hash = ''

  return new Promise((resolve) => {
    const req = https.get(parsedUrl, (res) => {
      if (res.statusCode !== 200) {
        res.resume()
        return resolve(false)
      }

      let rawBody = ''
      res.setEncoding('utf8')
      res.on('data', (chunk: string) => {
        rawBody += chunk
        if (rawBody.length > MAX_VERSION_BODY_LENGTH) {
          req.destroy()
          resolve(false)
        }
      })
      res.on('end', () => {
        const trimmedBody = rawBody.trim()
        resolve(trimmedBody != null && VERSION_REGEX.test(trimmedBody))
      })
    })

    req.on('error', () => resolve(false))
    req.setTimeout(3000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

function onGetSystemPlatform(event: IpcMainEvent): void {
  event.returnValue = systemPlatform
}

export default function registerIpcFunctions(): void {
  ipcMain.handle(VALIDATE_SERVER_URL, onValidateServerUrl)
  ipcMain.on(GET_SYSTEM_PLATFORM, onGetSystemPlatform)
}
