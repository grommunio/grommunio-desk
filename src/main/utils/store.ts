// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { app } from 'electron'
import path from 'path'
import fs from 'fs'

interface ConfigData {
  server?: string
  windowSize: number[]
}

interface Opts<T extends ConfigData = ConfigData> {
  readonly configName: string
  readonly defaults: T
}

class Store<T extends ConfigData = ConfigData> {
  path: string
  readonly data: T

  constructor(opts: Opts<T>) {
    const userDataPath = app.getPath('userData')
    this.path = path.join(userDataPath, opts.configName + '.json')
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
    windowSize: [1000, 800],
  },
})
