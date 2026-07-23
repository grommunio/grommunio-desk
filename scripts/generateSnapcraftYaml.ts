// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import fs from 'fs'

import pkg from '../package.json'
import { APP_DESCRIPTION } from '../constants'

const snapArch = process.arch === 'x64' ? 'amd64' : process.arch
const description = APP_DESCRIPTION.replace(/^(\r\n|\n|\r)+/, '').replace(/(\r\n|\n|\r)+$/, '')

const vars = {
  name: pkg.name,
  title: pkg.productName,
  version: pkg.version,
  summary: pkg.description,
  description: description,
  website: pkg.homepage,
  contact: pkg.author.email,
  sourceCode: pkg.repository.url,
  arch: snapArch,
  packageDir: `${pkg.productName}-linux-${process.arch}`,
}

const template = fs.readFileSync('./assets/linux/snap/snapcraft.template.yaml', 'utf8')
const result = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
  if (!(key in vars))
    throw new Error(`Unknown variable: ${key}`)
  return vars[key as keyof typeof vars]
})
fs.mkdirSync('./out/snap/gui', { recursive: true })
fs.writeFileSync('./out/snap/snapcraft.yaml', result)
fs.copyFileSync('./assets/general/icons/icon_512x512.png', './out/snap/icon.png')
fs.copyFileSync('./assets/linux/snap/grommunio-desk.desktop', './out/snap/gui/grommunio-desk.desktop')
