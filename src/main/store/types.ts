// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { LevelOption } from 'electron-log'

import { Server } from '../../types/misc'

export interface ConfigData {
  lastUsedServerId: Server['id'] | null
  servers: Server[]
  serverIdCount: number
  windowSize: [number, number]
  fileLogLevel: LevelOption
}
