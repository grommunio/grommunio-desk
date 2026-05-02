// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import dotenv from 'dotenv'
import { SystemPlatform, systemPlatform } from './constants'

const EnvConfigDataKeys = {
  APPLE_ID: ['mac'] as SystemPlatform[],
  APPLE_PASSWORD: ['mac'] as SystemPlatform[],
  APPLE_TEAM_ID: ['mac'] as SystemPlatform[],
  APPLE_SIGNING_IDENTITY: ['mac'] as SystemPlatform[],
  WINDOWS_PUBLISHER: ['win'] as SystemPlatform[],
  WINDOWS_KIT_VERSION: ['win'] as SystemPlatform[],
} satisfies Record<string, SystemPlatform[]>

class EnvConfig {
  constructor() {
    const result = dotenv.config({ quiet: true })
    if (result.error)
      throw result.error
  }

  get = (key: keyof typeof EnvConfigDataKeys, force = false): string => {
    const val = process.env[key]
    if (val == null) {
      if (force || EnvConfigDataKeys[key].includes(systemPlatform))
        throw new Error(`process.env.${String(key)} is undefined`)
      return ''
    }
    return val
  }
}

export default new EnvConfig()
