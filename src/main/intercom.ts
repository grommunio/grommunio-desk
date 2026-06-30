// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainInvokeEvent, IpcMainEvent } from 'electron'
import https from 'https'

import {
  GET_SYSTEM_PLATFORM,
  VALIDATE_SERVER_URL,
} from './constants/communication'
import { systemPlatform } from './constants/system'
import { ServerUrl, ServerSystem, ServerType } from '../types/misc'
import { firstNonNullPromise } from './utils/misc'
import Logger from '@utils/logger'

const logger = new Logger('main/intercom')

async function onValidateServerUrl(_event: IpcMainInvokeEvent, server: string): Promise<{ system: ServerSystem, url: ServerUrl } | null> {
  const MAX_VERSION_BODY_LENGTH = 8192
  const VERSION_ENDPOINTS: {
    serverPath?: string
    versionPath: string
    search?: string
    regex: RegExp
    type: ServerType
  }[] = [
    {
      serverPath: '/web', // Paths must always begin with a slash, but never end with one.
      versionPath: '/version',
      regex: /^(\d+(?:\.\d+)*)(?:\.[a-z0-9]+)?(?:-(?:lp\d+\.|\d+\+)\d+\.\d+)?$/,
      type: 'web',
    },
    {
      versionPath: '/api/v4/config/client',
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
  parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '')

  return firstNonNullPromise(VERSION_ENDPOINTS.map(endpoint => new Promise<{ system: ServerSystem, url: ServerUrl } | null>((resolve) => {
    const url = new URL(parsedUrl)
    if (endpoint.serverPath && !url.pathname.endsWith(endpoint.serverPath))
      url.pathname = (url.pathname + endpoint.serverPath).replace(/\/\/+/, '/')
    const versionUrl = new URL(url)
    versionUrl.pathname = (versionUrl.pathname + endpoint.versionPath).replace(/\/\/+/, '/')
    versionUrl.search = endpoint.search || ''

    const req = https.get(versionUrl, (res) => {
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
        if (trimmedBody != null && match != null && match.length > 1) {
          resolve({
            system: {
              type: endpoint.type,
              version: match[1],
            },
            url: url.toString(),
          })
        }
        else {
          logger.debug('onValidateServerUrl', `Version ${trimmedBody} does not match regular expression of ${endpoint.type}`)
          resolve(null)
        }
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
