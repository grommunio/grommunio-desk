// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainInvokeEvent, IpcMainEvent } from 'electron'
import https from 'https'

import {
  GET_SYSTEM_PLATFORM,
  VALIDATE_SERVER_URL,
} from './constants/communication'
import { systemPlatform } from './constants/system'
import { ServerSystem, ServerType } from '../types/misc'
import { firstNonNullPromise } from './utils/misc'

async function onValidateServerUrl(_event: IpcMainInvokeEvent, server: string): Promise<ServerSystem | null> {
  const MAX_VERSION_BODY_LENGTH = 8192
  const VERSION_ENDPOINTS: {
    path: string
    search?: string
    regex: RegExp
    type: ServerType
  }[] = [
    {
      path: '/web/version',
      regex: /^(\d+\.\d+\.\d+)\.[a-z0-9]+-(?:lp\d+\.|\d+\+)\d+\.\d+$/,
      type: 'web',
    },
    {
      path: '/api/v4/config/client',
      search: 'format=old',
      regex: /^{.*"Version":"(\d+\.\d+\.\d+)".*}$/,
      type: 'chat',
    },
  ]

  let parsedUrl: URL
  try {
    parsedUrl = new URL(server)
  }
  catch {
    return Promise.resolve(null)
  }

  return firstNonNullPromise(VERSION_ENDPOINTS.map(endpoint => new Promise<ServerSystem | null>((resolve) => {
    const url = new URL(parsedUrl)
    url.pathname = (url.pathname + endpoint.path).replace(/\/\/+/, '/')
    url.search = endpoint.search || ''

    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume()
        return resolve(null)
      }

      let rawBody = ''
      res.setEncoding('utf8')
      res.on('data', (chunk: string) => {
        rawBody += chunk
        if (rawBody.length > MAX_VERSION_BODY_LENGTH) {
          req.destroy()
          resolve(null)
        }
      })
      res.on('end', () => {
        const trimmedBody = rawBody.trim()
        const match = trimmedBody.match(endpoint.regex)
        if (trimmedBody != null && match != null && match.length > 1)
          resolve({
            type: endpoint.type,
            version: match[1],
          })
        else
          resolve(null)
      })
    })
    req.on('error', () => resolve(null))
    req.setTimeout(3000, () => {
      req.destroy()
      resolve(null)
    })
  })))
}

function onGetSystemPlatform(event: IpcMainEvent): void {
  event.returnValue = systemPlatform
}

export default function registerIpcFunctions(): void {
  ipcMain.handle(VALIDATE_SERVER_URL, onValidateServerUrl)
  ipcMain.on(GET_SYSTEM_PLATFORM, onGetSystemPlatform)
}
