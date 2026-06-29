// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

import { APP_NAME } from '../constants/app'

const appData = app.getPath('appData')
const legacyDir = path.join(appData, 'grommunio Desk')
const newDir = path.join(appData, APP_NAME)

try {
  if (fs.existsSync(legacyDir) && !fs.existsSync(newDir)) {
    fs.renameSync(legacyDir, newDir)
    console.log('Migrated UserData from legacy directory successfully')
  }
}
catch (error) {
  console.error('UserData migration failed', error)
}

app.name = APP_NAME
