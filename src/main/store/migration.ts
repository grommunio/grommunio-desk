// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import * as z from 'zod'
import fs from 'node:fs'

import { ZOOM_DEFAULT } from '../constants/zoom'
import { transformConfig } from './schema'
import { ConfigData } from './types'

const enum ConfigError {
  UNKNOWN = 'unknown',
  VERSION_MISMATCH = 'version_mismatch',
}
function analyzeConfigError(error: unknown): ConfigError {
  if (error instanceof z.ZodError
    && error.issues.some(issue => issue.code === 'invalid_value' && issue.path.length === 1 && issue.path[0] === 'version')) {
    return ConfigError.VERSION_MISMATCH
  }
  return ConfigError.UNKNOWN
}

const ConfigVersions = ['1.1.0-1'] as const
function includesValue<T extends U, U>(arr: readonly T[], val: U): val is T {
  return arr.includes(val as T)
}
function getConfigVersion(config: object): typeof ConfigVersions[number] | null {
  if ('version' in config && typeof config.version === 'string' && includesValue(ConfigVersions, config.version)) {
    return config.version
  }
  return null
}

const config1_0_0_serverSchema = z.strictObject({
  id: z.int(),
  url: z.string(),
  name: z.string(),
})
const config1_0_0_schema = z.strictObject({
  lastUsedServer: z.optional(config1_0_0_serverSchema),
  servers: z.array(config1_0_0_serverSchema),
  serverIdCount: z.int(),
  windowSize: z.tuple([z.int(), z.int()]),
  fileLogLevel: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'false']),
})
type config1_0_0_schemaType = z.infer<typeof config1_0_0_schema>
function config1_0_0_parseSchema(config: unknown): config1_0_0_schemaType | null {
  try {
    return config1_0_0_schema.parse(config)
  }
  catch {
    return null
  }
}

const config1_1_0_serverSchema = z.strictObject({
  id: z.int(),
  url: z.string(),
  name: z.string(),
  system: z.nullable(z.strictObject({
    type: z.enum(['web', 'chat']),
    version: z.string(),
  })),
})
const config1_1_0_schema = z.strictObject({
  lastUsedServer: z.optional(config1_1_0_serverSchema),
  servers: z.array(config1_1_0_serverSchema),
  serverIdCount: z.int(),
  windowSize: z.tuple([z.int(), z.int()]),
  fileLogLevel: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'false']),
})
type config1_1_0_schemaType = z.infer<typeof config1_1_0_schema>
function config1_1_0_parseSchema(config: unknown): config1_1_0_schemaType | null {
  try {
    return config1_1_0_schema.parse(config)
  }
  catch {
    return null
  }
}
function config1_1_0_migrateFromPreviousVersion(config: config1_0_0_schemaType): config1_1_0_schemaType {
  return {
    ...config,
    lastUsedServer: config.lastUsedServer == null ? undefined : { ...config.lastUsedServer, system: null },
    servers: config.servers.map(srv => ({ ...srv, system: null })),
  }
}

const config1_2_0_serverSchema = z.strictObject({
  id: z.int(),
  url: z.string(),
  name: z.string(),
  system: z.nullable(z.strictObject({
    type: z.enum(['web', 'chat']),
    version: z.string(),
  })),
  zoomLevel: z.number(),
})
const config1_2_0_schema = z.strictObject({
  version: z.literal('1.1.0-1'),
  lastUsedServerId: z.nullable(z.int()),
  servers: z.array(config1_2_0_serverSchema),
  serverIdCount: z.int(),
  windowSize: z.tuple([z.int(), z.int()]),
  fileLogLevel: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'false']),
})
type config1_2_0_schemaType = z.infer<typeof config1_2_0_schema>
function config1_2_0_parseSchema(config: unknown): config1_2_0_schemaType | null {
  try {
    return config1_2_0_schema.parse(config)
  }
  catch (error) {
    console.log(error)
    return null
  }
}
function config1_2_0_migrateFromPreviousVersion(config: config1_1_0_schemaType): config1_2_0_schemaType {
  const tmpConfig = Object.assign({}, config)
  delete tmpConfig.lastUsedServer
  return {
    ...tmpConfig,
    version: '1.1.0-1',
    lastUsedServerId: config.lastUsedServer?.id ?? null,
    servers: config.servers.map(srv => ({ ...srv, zoomLevel: ZOOM_DEFAULT })),
  }
}

export function migrateConfig(configPath: string, error: unknown): ConfigData | null {
  console.log('Trying to migrate config')
  const configError = analyzeConfigError(error)
  if (configError == ConfigError.UNKNOWN) {
    console.error('Unknown error occurred while loading config', error)
    return null
  }

  let stringData: string
  try {
    stringData = fs.readFileSync(configPath).toString()
  }
  catch (error) {
    console.error('Error loading config', error)
    return null
  }
  let jsonData: unknown
  try {
    jsonData = JSON.parse(stringData)
    if (!(jsonData instanceof Object)) {
      console.error('JSON config is not an object', stringData, jsonData)
      return null
    }
  }
  catch (error) {
    console.error('Error parsing JSON config', stringData, error)
    return null
  }

  if (configError === ConfigError.VERSION_MISMATCH) {
    const configVersion = getConfigVersion(jsonData)
    console.log(`Config version mismatch (${configVersion})`)
    if (configVersion == null) {
      const config1_0_0 = config1_0_0_parseSchema(jsonData)
      let config1_1_0: config1_1_0_schemaType
      if (config1_0_0 != null) {
        console.log('Config version match with legacy version 1.0.0')
        config1_1_0 = config1_1_0_migrateFromPreviousVersion(config1_0_0)
      }
      else {
        const tmp = config1_1_0_parseSchema(jsonData)
        if (tmp != null) {
          console.log('Config version match with legacy version 1.1.0')
          config1_1_0 = tmp
        }
        else {
          console.error('Config version does not match any of the legacy versions')
          return null
        }
      }
      const config1_2_0 = config1_2_0_migrateFromPreviousVersion(config1_1_0)
      const parsedConfig = config1_2_0_parseSchema(config1_2_0) // additional runtime check (does not change type)
      if (parsedConfig == null) {
        console.error('Parsing of migrated config failed')
        return null
      }
      return transformConfig(parsedConfig)
    }
  }
  return null
}
