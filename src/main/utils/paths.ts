// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { app } from 'electron'
import path from 'path'

const isProduction = process.env.NODE_ENV === 'production'

export function getResourcesPath(...paths: string[]): string {
  return path.join(app.getAppPath(), ...paths)
}

export function getExtraResourcesPath(...paths: string[]): string {
  return isProduction ? path.join(app.getAppPath(), '../', ...paths) : path.join(app.getAppPath(), ...paths)
}

export function getAppPath(...paths: string[]): string {
  return getResourcesPath(...paths)
}
