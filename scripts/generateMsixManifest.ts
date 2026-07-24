// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import fs from 'fs'

import pkg from '../package.json'
import envConfig from '../envConfig.ts'

const vars = {
  name: pkg.name,
  displayName: pkg.productName,
  appIdentifier: 'grommunio.grommunioDesk',
  version: `${pkg.version}.0`,
  description: pkg.description,
  arch: process.arch,
  publisher: envConfig.get('WINDOWS_PUBLISHER', true),
  publisherDisplayName: 'grommunio  GmbH', // two spaces intentionally
  minWindowsKitVersion: envConfig.get('MIN_WINDOWS_KIT_VERSION', true),
  windowsKitVersion: envConfig.get('WINDOWS_KIT_VERSION', true),
}

const template = fs.readFileSync('./assets/windows/msix/AppXManifest.template.xml', 'utf8')
const result = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
  if (!(key in vars))
    throw new Error(`Unknown variable: ${key}`)
  return vars[key as keyof typeof vars]
})
fs.writeFileSync('./assets/windows/msix/AppXManifest.xml', result)
