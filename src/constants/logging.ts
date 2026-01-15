// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { LevelOption } from 'electron-log'

export const LOG_FORMAT = '{y}-{m}-{d} {h}:{i}:{s} {text}'
export const LOG_LEVEL_CONSOLE: LevelOption = process.env.NODE_ENV === 'production' ? 'info' : 'debug'
