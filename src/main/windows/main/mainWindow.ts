// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { BaseWindow, Menu } from 'electron'

import store from '../../utils/store'
import { buildAppMenuTemplate } from '../../utils/appMenu'
import MainView from './mainView'

export default class MainWindow {
  private win?: BaseWindow
  private mainView?: MainView
  private server: string | undefined
  private isProduction: boolean

  constructor(isProduction: boolean, server: string | undefined) {
    this.server = server
    this.isProduction = isProduction
    this.createWindow()
  }

  createWindow = (): void => {
    if (this.win != null)
      return

    const windowSize = store.get('windowSize')
    this.win = new BaseWindow({
      minWidth: 800,
      minHeight: 600,
      width: windowSize[0],
      height: windowSize[1],
      title: 'grommunio Desk',
      show: false,
    })

    const isMac = process.platform === 'darwin'
    const menu = Menu.buildFromTemplate(buildAppMenuTemplate(isMac, this.switchServer, this.toggleMainViewDevTools))
    this.win.setMenu(menu)

    this.registerWinListeners()
    this.mainView = new MainView(this.isProduction)
    this.win.contentView.addChildView(this.mainView.create(this.win.getContentSize(), { server: this.server }))
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
      console.error('Variable \'win\' is unexpectedly null / undefined') // TODO: throw error instead of returning
      return
    }
    this.win.on('close', () => {
      if (this.win == null)
        return
      store.set('windowSize', this.win.getSize())
      this.win = undefined
    })
    this.win.on('closed', () => {
      this.mainView?.close()
    })
    this.win.on('resize', () => {
      if (this.win == null)
        return
      this.mainView?.adjustBounds(this.win.getContentSize())
    })
  }

  private switchServer = (): void => {
    store.set('server', undefined)
    this.server = undefined
    this.mainView?.reload({ server: undefined })
  }

  reloadMainView = (server: string | undefined): void => {
    this.server = server
    this.mainView?.reload({ server: server })
  }

  private toggleMainViewDevTools = (): void => {
    this.mainView?.toggleDevTools()
  }
}
