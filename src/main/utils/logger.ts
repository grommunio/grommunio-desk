// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import log from 'electron-log/main'

import { LOG_FORMAT, LOG_LEVEL_CONSOLE } from '../../constants/logging'
import { createLogClass } from '../../utils/logger'
import { IS_PRODUCTION } from '../../constants/misc'

log.initialize({ preload: false })

log.transports.file.format = LOG_FORMAT
log.transports.console.format = LOG_FORMAT

log.transports.file.level = IS_PRODUCTION ? 'info' : false // TODO: get log level from config
log.transports.console.level = LOG_LEVEL_CONSOLE

export default createLogClass(log)
