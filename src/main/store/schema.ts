// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import * as z from 'zod'

import { ConfigData } from './types'
import { CONFIG_VERSION } from './constants'

const serverSchema = z.strictObject({
  id: z.int(),
  url: z.string(),
  name: z.string(),
  system: z.nullable(z.strictObject({
    type: z.enum(['web', 'chat']),
    version: z.string(),
  })),
  zoomLevel: z.number(),
})
const configSchema = z.strictObject({
  version: z.literal(CONFIG_VERSION),
  lastUsedServerId: z.nullable(z.int()),
  servers: z.array(serverSchema),
  serverIdCount: z.int(),
  windowSize: z.tuple([z.int(), z.int()]),
  fileLogLevel: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'false']),
})

export function transformConfig(rawConfig: z.infer<typeof configSchema>): ConfigData {
  return {
    ...rawConfig,
    fileLogLevel: rawConfig.fileLogLevel === 'false' ? false : rawConfig.fileLogLevel,
  }
}
export function parseConfig(config: string): ConfigData {
  const parsedConfig = configSchema.parse(config)
  return transformConfig(parsedConfig)
}
