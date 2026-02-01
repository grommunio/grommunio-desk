// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Logger as ElectronLogger, LogLevel } from 'electron-log'

export const LOGGER_PADDING = {
  FUNCTION_NAME: 50,
  LOG_LEVEL: 10,
}

abstract class Logger {
  private fileName: string

  constructor(fileName = '') {
    this.fileName = fileName
  }

  protected formatMessage = (functionName: string, message: string, logLevel: LogLevel): string => {
    const prefix = this.fileName ? `${this.fileName}.` : ''
    return `[${prefix}${functionName}]`.padStart(LOGGER_PADDING.FUNCTION_NAME) + ` [${logLevel}]`.padStart(LOGGER_PADDING.LOG_LEVEL) + ` > ${message}`
  }

  // TODO: add 'public' visibility explicitly?
  abstract silly(functionName: string, message: string, ...args: unknown[]): void
  abstract debug(functionName: string, message: string, ...args: unknown[]): void
  abstract verbose(functionName: string, message: string, ...args: unknown[]): void
  abstract info(functionName: string, message: string, ...args: unknown[]): void
  abstract warn(functionName: string, message: string, ...args: unknown[]): void
  abstract error(functionName: string, message: string, ...args: unknown[]): void
}

export function createLogClass(log: ElectronLogger): new (fileName?: string) => Logger {
  return class ProcessLogger extends Logger {
    // TODO: improve logging functions: add functionality for formatted message string (%s for strings, ...)
    silly = (functionName: string, message: string, ...args: unknown[]): void => {
      log.silly(this.formatMessage(functionName, message, 'silly'), ...args)
    }

    debug = (functionName: string, message: string, ...args: unknown[]): void => {
      log.debug(this.formatMessage(functionName, message, 'debug'), ...args)
    }

    verbose = (functionName: string, message: string, ...args: unknown[]): void => {
      log.verbose(this.formatMessage(functionName, message, 'verbose'), ...args)
    }

    info = (functionName: string, message: string, ...args: unknown[]): void => {
      log.info(this.formatMessage(functionName, message, 'info'), ...args)
    }

    warn = (functionName: string, message: string, ...args: unknown[]): void => {
      log.warn(this.formatMessage(functionName, message, 'warn'), ...args)
    }

    error = (functionName: string, message: string, ...args: unknown[]): void => {
      log.error(this.formatMessage(functionName, message, 'error'), ...args)
    }
  }
}
