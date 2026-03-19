// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainInvokeEvent } from 'electron'
import https from 'https'

import {
  VALIDATE_SERVER_URL,
} from './constants/communication'

const MAX_VERSION_BODY_LENGTH = 4096
const VERSION_ENDPOINT_PATH = '/web/version'
const VERSION_REGEX = /^\d+\.\d+\.\d+\.[a-z0-9]+-(lp\d+\.|\d+\+)\d+\.\d+$/

function validateServerUrl(server: string): Promise<boolean> {
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

export default function registerIpcFunctions(): void {
  ipcMain.handle(VALIDATE_SERVER_URL, async (_event: IpcMainInvokeEvent, server: string) => {
    return validateServerUrl(server)
  })
}
