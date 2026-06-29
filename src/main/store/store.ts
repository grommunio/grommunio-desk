// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import fs from 'fs'

import { ConfigData } from './types'
import { Server } from '../../types/misc'
import { getUserDataPath } from '../utils/paths'
import { parseConfig } from './schema'
import { CONFIG_VERSION } from './constants'
import { migrateConfig } from './migration'
import { isSystemError } from './utils'

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
    this.writeConfigFile(this.data)
  }

  private readConfigFile = (defaults: ConfigData): ConfigData => {
    let stringData: string
    try {
      stringData = fs.readFileSync(this.path).toString()
    }
    catch (error) {
      if (isSystemError(error) && error.code === 'ENOENT') {
        console.warn('Config file was not found. Continuing with config defaults')
      }
      else {
        console.error('Unknown error occurred while loading config', error)
      }
      return defaults
    }

    let jsonData: unknown
    try {
      jsonData = JSON.parse(stringData)
      if (!(jsonData instanceof Object)) {
        console.error('JSON config is not an object')
        return defaults
      }
    }
    catch (error) {
      console.error('Error parsing JSON config', error)
      return defaults
    }

    try {
      return parseConfig(jsonData)
    }
    catch {
      console.warn('Error parsing config schema')
      const migratedConfig = migrateConfig(jsonData)
      if (migratedConfig != null) {
        console.log('Successfully migrated config')
        this.writeConfigFile(migratedConfig)
        return migratedConfig
      }
      else {
        console.error('Config migration failed. Continuing with config defaults')
        this.writeConfigFile(defaults)
        return defaults
      }
    }
  }

  private writeConfigFile = (data: ConfigData): void => {
    try {
      fs.writeFileSync(this.path, JSON.stringify({ ...data, version: CONFIG_VERSION }))
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
