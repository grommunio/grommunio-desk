// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { app } from 'electron'
import path from 'path'
import { IS_PRODUCTION } from '../../constants/misc'

export function getResourcesPath(...paths: string[]): string {
  return path.join(app.getAppPath(), ...paths)
}

export function getExtraResourcesPath(...paths: string[]): string {
  return IS_PRODUCTION ? path.join(process.resourcesPath, ...paths) : path.join(app.getAppPath(), '.webpack/main', ...paths)
}

export function getAppPath(...paths: string[]): string {
  return getResourcesPath(...paths)
}

export function getUserDataPath(...paths: string[]): string {
  return path.join(app.getPath('userData'), ...paths)
}
