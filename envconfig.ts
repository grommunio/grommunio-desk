// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import dotenv from 'dotenv'

const systemPlatform = process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux' // redundant code to avoid ./src dependencies
type EnvConfigDataKeys = 'APPLE_ID' | 'APPLE_PASSWORD' | 'APPLE_TEAM_ID' | 'APPLE_SIGNING_IDENTITY'

type SystemPlatform = 'linux' | 'mac' | 'win'

class EnvConfig<T extends EnvConfigDataKeys = EnvConfigDataKeys> {
  constructor() {
    const result = dotenv.config()
    if (result.error)
      throw result.error
  }

  get = <K extends T>(key: K, platforms: SystemPlatform[]): string => {
    const val = process.env[key]
    if (val == null) {
      if (platforms.includes(systemPlatform))
        throw new Error(`process.env.${String(key)} is undefined`)
      return ''
    }
    return val
  }
}

export default new EnvConfig()
