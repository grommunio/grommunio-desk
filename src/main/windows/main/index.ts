// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { BrowserWindow, shell, HandlerDetails, WindowOpenHandlerResponse, Menu } from 'electron'

import store from '../../utils/store'
import { getAppPath } from '../../utils/utils'
import { buildAppMenuTemplate } from '../../utils/appMenu'

export default class MainWindow {
  win?: BrowserWindow
  server: string | undefined
  isProduction: boolean

  constructor(isProduction: boolean, server: string | undefined) {
    this.server = server
    this.isProduction = isProduction
    this.createWindow()
  }

  createWindow = (): void => {
    if (this.win != null)
      return

    const windowSize = store.get('windowSize')
    this.win = new BrowserWindow({
      minWidth: 800,
      minHeight: 600,
      width: windowSize[0],
      height: windowSize[1],
      title: 'grommunio Desk',
      webPreferences: {
        preload: getAppPath('preload.js'),
      },
      show: false,
    })

    const isMac = process.platform === 'darwin'
    const menu = Menu.buildFromTemplate(buildAppMenuTemplate(isMac, this.switchServer))
    this.win.setMenu(menu)

    this.registerWinListeners()
    this.loadView()
  }

  private loadView = (): void => {
    if (this.win == null)
      return

    this.registerViewListeners()

    console.log('Server', this.server)

    if (this.server != undefined) {
      this.win.webContents.loadURL(this.server)
    }
    else {
      if (this.isProduction)
        this.win.webContents.loadFile('main.html')
      else
        this.win.webContents.loadURL('http://localhost:8080/main.html')
    }

    if (!this.isProduction)
      this.win.webContents.openDevTools()
  }

  reloadView = (server: string | undefined): void => {
    this.server = server
    this.loadView()
  }

  show = (): void => {
    if (this.win == null) {
      console.error('Variable \'win\' is null / undefined')
      return
    }
    this.win.show()
  }

  private registerWinListeners = (): void => {
    if (this.win == null) {
      console.error('Variable \'win\' is unexpectedly null / undefined')
      return
    }
    this.win.on('close', () => {
      if (this.win == null)
        return
      store.set('windowSize', this.win.getSize())
      this.win = undefined
    })
  }

  private registerViewListeners = (): void => {
    if (this.win == null) {
      console.error('Variable \'win\' is unexpectedly null / undefined')
      return
    }

    this.win.webContents.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    this.win.webContents.on('will-prevent-unload', (e) => {
      e.preventDefault()
    })

    this.win.webContents.setWindowOpenHandler(({ url }: HandlerDetails): WindowOpenHandlerResponse => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    // TODO: prevent redirects to external pages
  }

  private switchServer = (): void => {
    store.set('server', undefined)
    this.reloadView(undefined)
  }
}
