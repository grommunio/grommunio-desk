// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { BaseWindow, Menu, ipcMain, IpcMainEvent } from 'electron'

import store from '../../utils/store'
import { buildAppMenuTemplate } from '../../utils/appMenu'
import MainView from './mainView'
import TitleBarView from './titleBar'
import { TITLE_BAR } from '../../../constants/window'
import { CONFIG_SAVE_SERVER } from '../../constants/communication'
import { ServerURL } from '../../../types/misc'

export default class MainWindow {
  private win?: BaseWindow
  private mainView?: MainView
  private titleBarView?: TitleBarView
  private server: ServerURL
  private isProduction: boolean

  constructor(isProduction: boolean, server: ServerURL) {
    this.isProduction = isProduction
    this.server = server

    ipcMain.on(CONFIG_SAVE_SERVER, this.onConfigSaveServer)

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
      titleBarStyle: 'hidden',
      ...(process.platform !== 'darwin'
        ? { titleBarOverlay:
            {
              color: TITLE_BAR.BACKGROUND_COLOR,
              symbolColor: TITLE_BAR.COLOR,
              height: TITLE_BAR.HEIGHT,
            },
          }
        : {}
      ),
      show: false,
    })

    const isMac = process.platform === 'darwin'
    const menu = Menu.buildFromTemplate(buildAppMenuTemplate({
      isMac,
      resetServer: () => this.reloadMainView(undefined),
      onToggleMainViewDevTools: this.toggleMainViewDevTools,
      onToggleTitleBarDevTools: this.toggleTitleBarViewDevTools,
    }))
    this.win.setMenu(menu)

    this.registerWinListeners()

    this.mainView = new MainView(this.isProduction)
    this.win.contentView.addChildView(this.mainView.create(this.win.getContentSize(), { server: this.server }))

    this.titleBarView = new TitleBarView(this.isProduction)
    this.win.contentView.addChildView(this.titleBarView.create(this.win.getContentSize()))
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
      this.titleBarView?.close()
    })
    this.win.on('resize', () => {
      if (this.win == null)
        return
      const winSize = this.win.getSize()
      this.mainView?.adjustBounds(winSize)
      this.titleBarView?.adjustBounds(winSize)
    })
  }

  private reloadMainView = (server: ServerURL): void => {
    store.set('server', server)
    this.server = server
    this.mainView?.reload({ server })
  }

  private onConfigSaveServer = (_event: IpcMainEvent, server: ServerURL): void => {
    this.reloadMainView(server)
  }

  private toggleMainViewDevTools = (): void => {
    this.mainView?.toggleDevTools()
  }

  private toggleTitleBarViewDevTools = (): void => {
    this.titleBarView?.toggleDevTools()
  }
}
