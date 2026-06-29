// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import fs from 'fs'

import { ConfigData } from './types'
import { Server } from '../../types/misc'
import { getUserDataPath } from '../utils/paths'
import { parseConfig } from './schema'
import { CONFIG_VERSION } from './constants'
import { migrateConfig } from './migration'

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
    try {
      const stringData = fs.readFileSync(this.path).toString()
      const jsonData = JSON.parse(stringData)
      return parseConfig(jsonData)
    }
    catch (error) {
      console.warn('Error loading config')
      const migratedConfig = migrateConfig(this.path, error)
      if (migratedConfig != null) {
        console.log('Successfully migrated config')
        this.writeConfigFile(migratedConfig)
        return migratedConfig
      }
      else {
        console.warn('Config migration failed. Continuing with config defaults')
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
