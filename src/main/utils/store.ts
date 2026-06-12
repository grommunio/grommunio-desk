// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import fs from 'fs'
import { LevelOption } from 'electron-log'

import { Server } from '../../types/misc'
import { getUserDataPath } from './paths'

interface ConfigData {
  lastUsedServerId?: Server['id']
  servers: Server[]
  serverIdCount: number
  windowSize: number[]
  fileLogLevel: LevelOption
}

interface Opts<T extends ConfigData = ConfigData> {
  readonly configName: string
  readonly defaults: T
}

class Store<T extends ConfigData = ConfigData> {
  private path: string
  private readonly data: T

  constructor(opts: Opts<T>) {
    this.path = getUserDataPath(opts.configName + '.json')
    this.data = this.readConfigFile(opts.defaults as T)
  }

  get = <K extends keyof T>(key: K): T[K] => {
    return this.data[key] as T[K]
  }

  set = <K extends keyof T>(key: K, val: T[K]): void => {
    this.data[key] = val
    this.writeConfigFile()
  }

  private readConfigFile = (defaults: T): T => {
    try {
      return { ...defaults, ...JSON.parse(fs.readFileSync(this.path).toString()) as T }
    }
    catch {
      return defaults
    }
  }

  private writeConfigFile = (): void => {
    fs.writeFileSync(this.path, JSON.stringify(this.data)) // TODO: try-catch that
  }
}

export default new Store<ConfigData>({
  configName: 'config',
  defaults: {
    serverIdCount: 0,
    servers: Array<Server>(),
    windowSize: [1000, 800],
    fileLogLevel: 'info',
  },
})
