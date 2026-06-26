// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import * as z from 'zod'

import { ConfigData } from './types'

const rawConfigSchema = z.object({
  lastUsedServerId: z.nullable(z.int()),
  servers: z.array(z.object({
    id: z.int(),
    url: z.string(),
    name: z.string(),
    system: z.nullable(z.object({
      type: z.enum(['web', 'chat']),
      version: z.string(),
    })),
  })),
  serverIdCount: z.int(),
  windowSize: z.tuple([z.int(), z.int()]),
  fileLogLevel: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'false']),
})

type RecursiveThrowIfExtraKeys<Schema, Model> = [Schema] extends [object] // prevent union distribution
  ? [Model] extends [object]
      ? { [K in keyof Schema]: K extends keyof Model
          ? RecursiveThrowIfExtraKeys<NonNullable<Schema[K]>, NonNullable<Model[K]>> | Extract<Model[K], null | undefined>
          : never }
      : unknown
  : unknown

function transformRawConfig(rawConfig: z.infer<typeof rawConfigSchema>
  & RecursiveThrowIfExtraKeys<z.infer<typeof rawConfigSchema>, ConfigData>): ConfigData {
  return {
    ...rawConfig,
    fileLogLevel: rawConfig.fileLogLevel === 'false' ? false : rawConfig.fileLogLevel,
  }
}
export function parseConfig(config: string): ConfigData {
  const parsedConfig = rawConfigSchema.parse(config)
  return transformRawConfig(parsedConfig)
}
