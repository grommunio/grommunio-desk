// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import log from 'electron-log/renderer'

import { LOG_FORMAT, LOG_LEVEL_CONSOLE } from '../../constants/logging'
import { createLogClass } from '../../utils/logger'

log.transports.console.format = LOG_FORMAT

log.transports.console.level = LOG_LEVEL_CONSOLE

log.transports.ipc.level = false

export default createLogClass(log)
