// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { app, session, net } from 'electron'
import squirrelStartup from 'electron-squirrel-startup'
import path from 'node:path'
import url from 'node:url'
import { execFileSync } from 'node:child_process'

import Logger from '@utils/logger'
import { APP_ID, APP_PRODUCT_NAME } from './constants/app'
import { getExtraResourcesPath } from './utils/paths'
import { systemPlatform } from './constants/system'
import MainWindow from './mainWindow'
import registerIpcFunctions from './intercom'
import { IS_PRODUCTION } from '../constants/misc'
import TrayMenu from './trayMenu'
import { throwIfPropertyUndefined } from './utils/misc'
import { addMailtoRegistryEntry, removeMailtoRegistryEntry } from './scripts/squirrelRegistryEntry'
import { setupSpellChecker } from './utils/spellChecker'

const logger = new Logger('main/index')

logger.verbose('isProduction', `Production: ${IS_PRODUCTION}`)

let mainWindow: MainWindow | undefined

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('mailto', process.execPath, [
      path.resolve(process.argv[1]),
    ])
  }
}
else {
  app.setAsDefaultProtocolClient('mailto')
}

const createWindow = (): void => {
  if (mainWindow == null)
    mainWindow = new MainWindow()
  else
    mainWindow.createWindow()
  mainWindow.show()
}

const onOpenAppClick = (): void => {
  if (mainWindow?.isWindowDefined())
    mainWindow.focus()
  else
    createWindow()
}

const handleUrl = (url: string): void => {
  url = url.toLowerCase()
  const URL_REGEX = /^[a-z]+:.*$/
  if (!URL_REGEX.test(url))
    return
  throwIfPropertyUndefined('mainWindow', mainWindow)
  mainWindow.handleUrl(url)
}

const handleArgv = (argv: string[]): void => {
  if (argv.length < 2)
    return
  const arg = argv.pop()
  if (arg != null)
    handleUrl(arg)
}

const handleSquirrelEvent = (): void => {
  if (process.argv.length === 1)
    return

  const squirrelEvent = process.argv[1]
  const exeName = path.basename(process.execPath)
  const updateDotExePath = path.resolve(process.execPath, '../../Update.exe')

  const execUpdate = (...args: string[]): void => {
    try {
      execFileSync(updateDotExePath, args)
    }
    catch (e) {
      logger.error('handleSquirrelEvent', 'Error while executing Update.exe with args', updateDotExePath, args, e)
    }
  }

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      addMailtoRegistryEntry()
      execUpdate('--createShortcut', exeName)
      setTimeout(app.quit, 1000)
      return
    case '--squirrel-uninstall':
      removeMailtoRegistryEntry()
      execUpdate('--removeShortcut', exeName)
      setTimeout(app.quit, 1000)
      return
    case '--squirrel-obsolete':
      return
  }
  return
}

if (squirrelStartup) { // squirrel events
  app.quit()
  handleSquirrelEvent()
}
else if (!app.requestSingleInstanceLock()) {
  app.quit()
}
else {
  app.on('ready', () => {
    logger.silly('app.ready', 'Starting app with argv', process.argv)

    session.defaultSession.protocol.handle('static', (request) => {
      const fileUrl = request.url.replace('static://', '')
      const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl)
      return net.fetch(url.pathToFileURL(filePath).toString())
    })

    setupSpellChecker(session.defaultSession)

    if (systemPlatform === 'win')
      app.setAppUserModelId(APP_ID)

    registerIpcFunctions()

    app.setAboutPanelOptions({
      applicationName: APP_PRODUCT_NAME,
      applicationVersion: app.getVersion(),
      copyright: `Copyright (c) 2020-${new Date().getFullYear()} grommunio GmbH. All Rights Reserved.`,
      version: app.getVersion(),
      credits: 'grommunio GmbH',
      website: 'https://grommunio.com',
      iconPath: getExtraResourcesPath('icon_512x512.png'),
    })

    createWindow()

    new TrayMenu(onOpenAppClick)
    handleArgv(process.argv)
  })

  app.on('window-all-closed', () => {
    // stay active in background
  })

  app.on('activate', () => {
    logger.silly('app.activate', 'activate was triggered')
    onOpenAppClick()
  })

  app.on('second-instance', (_event, argv) => {
    logger.silly('app.second-instance', 'second-instance was triggered with argv', argv)
    onOpenAppClick()
    handleArgv(argv)
  })

  // for MacOS
  app.on('open-url', (_event, url) => {
    logger.silly('app.open-url', 'open-url was triggered with url', url)
    onOpenAppClick()
    handleUrl(url)
  })
}
