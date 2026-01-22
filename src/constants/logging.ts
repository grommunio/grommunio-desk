// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { LevelOption } from 'electron-log'

import { IS_PRODUCTION } from './misc'

export const LOG_FORMAT = '{y}-{m}-{d} {h}:{i}:{s} {text}'
export const LOG_LEVEL_CONSOLE: LevelOption = IS_PRODUCTION ? 'info' : 'debug'
