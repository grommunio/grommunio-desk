// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import log from 'electron-log/main'

import { LOG_FORMAT, LOG_LEVEL_CONSOLE } from '../../constants/logging'
import { createLogClass, LOGGER_PADDING } from '../../utils/logger'
import { IS_PRODUCTION } from '../../constants/misc'
import { getUserDataPath } from './paths'
import store from './store'

log.transports.console.format = LOG_FORMAT
log.transports.console.level = LOG_LEVEL_CONSOLE

log.transports.file.format = LOG_FORMAT
log.transports.file.level = IS_PRODUCTION ? store.get('fileLogLevel') : false
log.transports.file.resolvePathFn = (_variables, msg): string => {
  if (msg?.variables?.processType === 'renderer')
    return getUserDataPath('logs/renderer.log')
  else
    return getUserDataPath('logs/main.log')
}

log.initialize()

log.eventLogger.format = ({ args, eventName, eventSource }): string[] => {
  return [`[eventLogger.${eventSource}.${eventName}]`.padStart(LOGGER_PADDING.FUNCTION_NAME + LOGGER_PADDING.LOG_LEVEL) + ` >`, JSON.stringify(args)]
}
log.eventLogger.startLogging({
  events: {
    app: {
      'certificate-error': true,
      'child-process-gone': true,
      'render-process-gone': true,
    },
    webContents: {
      'did-fail-load': true,
      'did-fail-provisional-load': true,
      'plugin-crashed': true,
      'preload-error': true,
      'unresponsive': true,
    },
  },
  level: 'error',
})

log.errorHandler.startCatching()

export default createLogClass(log)
