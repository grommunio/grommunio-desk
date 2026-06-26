// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import fs from 'fs'
import { ZodError } from 'zod'

import { ConfigData } from './types'
import { Server } from '../../types/misc'
import { getUserDataPath } from '../utils/paths'
import { parseConfig } from './schema'
import { CONFIG_VERSION } from './constants'

class Store {
  private path: string
  private readonly data: ConfigData

  constructor(configName: string, defaults: ConfigData) {
    this.path = getUserDataPath(configName + '.json')
    this.data = this.readConfigFile(defaults)
  }

  get = <K extends keyof ConfigData>(key: K): ConfigData[K] => {
    return this.data[key]
  }

  set = <K extends keyof ConfigData>(key: K, val: ConfigData[K]): void => {
    this.data[key] = val
    this.writeConfigFile()
  }

  private readConfigFile = (defaults: ConfigData): ConfigData => {
    let rawStringData: string | null = null
    try {
      rawStringData = fs.readFileSync(this.path).toString()
      const rawJsonData = JSON.parse(rawStringData)
      const parsedData = parseConfig(rawJsonData)
      return { ...defaults, ...parsedData }
    }
    catch (error) {
      if (error instanceof ZodError) {
        console.error('Error parsing config', rawStringData, error)
      }
      else {
        console.log('Error loading config', rawStringData, error)
      }
      return defaults
    }
  }

  private writeConfigFile = (): void => {
    try {
      fs.writeFileSync(this.path, JSON.stringify({ ...this.data, version: CONFIG_VERSION }))
    }
    catch (error) {
      console.error('Error saving config', error)
    }
  }
}

export default new Store(
  'config',
  {
    lastUsedServerId: null,
    servers: Array<Server>(),
    serverIdCount: 0,
    windowSize: [1000, 800],
    fileLogLevel: 'info',
  },
)
