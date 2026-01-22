// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { BaseWindow, Menu, ipcMain, IpcMainEvent } from 'electron'

import store from '../utils/store'
import { buildAppMenuTemplate } from '../utils/appMenu'
import MainView from './mainView'
import TitleBarView from './titleBarView'
import { TITLE_BAR } from '../../constants/window'
import { CONFIG_SAVE_SERVER, TOGGLE_APP_MENU } from '../constants/communication'
import { ServerURL } from '../../types/misc'
import { throwIfPropertyUndefined } from '../utils/misc'

export default class MainWindow {
  private win?: BaseWindow
  private appMenu?: Menu
  private mainView?: MainView
  private titleBarView?: TitleBarView
  private server: ServerURL

  constructor(server: ServerURL) {
    this.server = server

    ipcMain.on(CONFIG_SAVE_SERVER, this.onConfigSaveServer)
    ipcMain.on(TOGGLE_APP_MENU, this.onToggleAppMenu)

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
    this.appMenu = Menu.buildFromTemplate(buildAppMenuTemplate({
      isMac,
      resetServer: () => this.switchServer(undefined),
      onToggleMainViewDevTools: this.toggleMainViewDevTools,
      onToggleTitleBarDevTools: this.toggleTitleBarViewDevTools,
    }))
    this.win.setMenu(this.appMenu)

    this.registerWinListeners()
    this.registerMenuListeners()

    this.mainView = new MainView(this.onServerSwitch)
    this.win.contentView.addChildView(this.mainView.create(this.win.getContentSize(), { server: this.server }))

    this.titleBarView = new TitleBarView(this.onTitleBarDidFinishLoad)
    this.win.contentView.addChildView(this.titleBarView.create(this.win.getContentSize()))
  }

  show = (): void => {
    throwIfPropertyUndefined('win', this.win) // TODO: catch exceptions in main process and write to log

    this.win.show()
  }

  private registerWinListeners = (): void => {
    throwIfPropertyUndefined('win', this.win)

    this.win.on('close', () => {
      throwIfPropertyUndefined('win', this.win)

      store.set('windowSize', this.win.getSize())
      this.win = undefined
    })
    this.win.on('closed', () => {
      this.mainView?.close()
      this.titleBarView?.close()
    })
    this.win.on('resize', () => {
      throwIfPropertyUndefined('win', this.win)

      const winSize = this.win.getSize()
      this.mainView?.adjustBounds(winSize)
      this.titleBarView?.adjustBounds(winSize)
    })
  }

  private registerMenuListeners = (): void => {
    throwIfPropertyUndefined('appMenu', this.appMenu)

    this.appMenu.on('menu-will-close', () => {
      this.titleBarView?.sendAppMenuClose()
    })
  }

  private switchServer = (server: ServerURL): void => {
    if (server === this.server)
      return
    store.set('server', server)
    this.server = server
    this.mainView?.reload({ server })
  }

  private toggleMainViewDevTools = (): void => {
    this.mainView?.toggleDevTools()
  }

  private toggleTitleBarViewDevTools = (): void => {
    this.titleBarView?.toggleDevTools()
  }

  private onServerSwitch = (server: ServerURL): void => {
    this.titleBarView?.sendServerSwitch(server)
  }

  private onTitleBarDidFinishLoad = (): void => {
    this.titleBarView?.sendServerSwitch(this.server)
  }

  // IPC functions
  private onConfigSaveServer = (_event: IpcMainEvent, server: ServerURL): void => {
    this.switchServer(server)
  }

  private onToggleAppMenu = (_event: IpcMainEvent): void => {
    this.appMenu?.popup({
      window: this.win,
      x: 18,
      y: 18,
    })
  }
}
