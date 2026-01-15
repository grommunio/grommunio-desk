// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { Logger as ElectronLogger, LogLevel } from 'electron-log'

abstract class Logger {
  private fileName: string

  constructor(fileName = '') {
    this.fileName = fileName
  }

  protected formatMessage = (functionName: string, message: string, logLevel: LogLevel): string => {
    const prefix = this.fileName ? `${this.fileName}.` : ''
    return `[${prefix}${functionName}] [${logLevel}] > ${message}`
  }

  public abstract silly(functionName: string, message: string, ...args: unknown[]): void
  public abstract debug(functionName: string, message: string, ...args: unknown[]): void
  public abstract verbose(functionName: string, message: string, ...args: unknown[]): void
  public abstract info(functionName: string, message: string, ...args: unknown[]): void
  public abstract warn(functionName: string, message: string, ...args: unknown[]): void
  public abstract error(functionName: string, message: string, ...args: unknown[]): void
}

export function createLogClass(log: ElectronLogger): new (fileName?: string) => Logger {
  return class ProcessLogger extends Logger {
    public silly = (functionName: string, message: string, ...args: unknown[]): void => {
      log.silly(this.formatMessage(functionName, message, 'silly'), ...args)
    }

    public debug = (functionName: string, message: string, ...args: unknown[]): void => {
      log.debug(this.formatMessage(functionName, message, 'debug'), ...args)
    }

    public verbose = (functionName: string, message: string, ...args: unknown[]): void => {
      log.verbose(this.formatMessage(functionName, message, 'verbose'), ...args)
    }

    public info = (functionName: string, message: string, ...args: unknown[]): void => {
      log.info(this.formatMessage(functionName, message, 'info'), ...args)
    }

    public warn = (functionName: string, message: string, ...args: unknown[]): void => {
      log.warn(this.formatMessage(functionName, message, 'warn'), ...args)
    }

    public error = (functionName: string, message: string, ...args: unknown[]): void => {
      log.error(this.formatMessage(functionName, message, 'error'), ...args)
    }
  }
}
