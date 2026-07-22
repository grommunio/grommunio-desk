// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { execFileSync } from 'node:child_process'

import Logger from '@utils/logger'
import { APP_NAME, APP_PRODUCT_NAME, APP_DESCRIPTION } from '../constants/app'

const logger = new Logger('main/scripts/windowsRegistryHandler')
const HKCU_CLIENTS_APP_KEY = `HKCU\\Software\\Clients\\Mail\\${APP_PRODUCT_NAME}`
const APP_MAILTO_NAME = `${APP_NAME}-mailto`
const HKCU_CLASSES_APP_KEY = `HKCU\\Software\\Classes\\${APP_MAILTO_NAME}`

function execRegCmd(...args: string[]): void {
  try {
    execFileSync('reg', args)
  }
  catch (e) {
    logger.error('execRegCmd', 'Error while executing reg command with args', args, e)
  }
}

export function addMailtoRegistryEntry(): void {
  logger.info('addMailtoRegistryEntry', 'Add Mailto registry entries')
  const cmd = `"${process.execPath}" "%1"`

  execRegCmd('ADD', HKCU_CLIENTS_APP_KEY, '/ve', '/d', APP_PRODUCT_NAME, '/f')
  execRegCmd('ADD', `${HKCU_CLIENTS_APP_KEY}\\Capabilities`, '/v', 'ApplicationName', '/d', APP_PRODUCT_NAME, '/f')
  execRegCmd('ADD', `${HKCU_CLIENTS_APP_KEY}\\Capabilities`, '/v', 'ApplicationDescription', '/d', APP_DESCRIPTION, '/f')
  execRegCmd('ADD', `${HKCU_CLIENTS_APP_KEY}\\Capabilities\\URLAssociations`, '/v', 'mailto', '/d', APP_MAILTO_NAME, '/f')
  execRegCmd('ADD', `${HKCU_CLIENTS_APP_KEY}\\Protocols\\mailto`, '/ve', '/d', 'URL:MailTo Protocol', '/f')
  execRegCmd('ADD', `${HKCU_CLIENTS_APP_KEY}\\Protocols\\mailto`, '/v', 'URL Protocol', '/d', '', '/f')
  execRegCmd('ADD', `${HKCU_CLIENTS_APP_KEY}\\Protocols\\mailto\\shell\\open\\command`, '/ve', '/d', cmd, '/f')

  execRegCmd('ADD', HKCU_CLASSES_APP_KEY, '/ve', '/d', APP_PRODUCT_NAME, '/f')
  execRegCmd('ADD', HKCU_CLASSES_APP_KEY, '/v', 'URL Protocol', '/d', '', '/f')
  execRegCmd('ADD', `${HKCU_CLASSES_APP_KEY}\\shell\\open\\command`, '/ve', '/d', cmd, '/f')

  execRegCmd('ADD', 'HKCU\\Software\\RegisteredApplications', '/v', APP_PRODUCT_NAME, '/d', `Software\\Clients\\Mail\\${APP_PRODUCT_NAME}\\Capabilities`, '/f')

  // register app as default mailto handler
  // execRegCmd('ADD', 'HKCU\\Software\\Classes\\mailto', '/ve', '/d', 'URL:MailTo Protocol', '/f')
  // execRegCmd('ADD', 'HKCU\\Software\\Classes\\mailto', '/v', 'URL Protocol', '/d', '', '/f')
  // execRegCmd('ADD', 'HKCU\\Software\\Classes\\mailto\\shell\\open\\command', '/ve', '/d', cmd, '/f')
}

export function removeMailtoRegistryEntry(): void {
  logger.info('removeMailtoRegistryEntry', 'Remove Mailto registry entries')
  execRegCmd('DELETE', HKCU_CLIENTS_APP_KEY, '/f')
  execRegCmd('DELETE', HKCU_CLASSES_APP_KEY, '/f')
  execRegCmd('DELETE', 'HKCU\\Software\\RegisteredApplications', '/v', APP_PRODUCT_NAME, '/f')
}
