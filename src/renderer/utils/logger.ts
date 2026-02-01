// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import log from 'electron-log/renderer'

import { LOG_FORMAT, LOG_LEVEL_CONSOLE } from '../../constants/logging'
import { createLogClass } from '../../utils/logger'

log.transports.console.format = LOG_FORMAT
log.transports.console.level = LOG_LEVEL_CONSOLE

log.transports.ipc.level = 'silly'

// TODO: bug in electron-log: errors in renderer process will be forwarded to main process via ipc with processtype 'main'
// (instead of 'renderer') -> so they will be logged in main.log (instead of renderer.log)
log.errorHandler.startCatching()

export default createLogClass(log)
