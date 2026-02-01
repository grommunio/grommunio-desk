// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { BaseWindow, Menu, ipcMain, IpcMainEvent, View } from 'electron'

import store from '../utils/store'
import { buildAppMenuTemplate } from '../utils/appMenu'
import TitleBarView from './titleBarView'
import { TITLE_BAR } from '../../constants/window'
import { TOGGLE_APP_MENU } from '../constants/communication'
import { Server } from '../../types/misc'
import { throwIfPropertyUndefined } from '../utils/misc'
import ViewManager from './viewManager'

export default class MainWindow {
  private win?: BaseWindow
  private appMenu?: Menu
  private viewManager: ViewManager
  private titleBarView?: TitleBarView

  constructor() {
    this.viewManager = new ViewManager(
      this.switchWindowView,
      this.onServerSwitch,
      this.onServerSave,
    )

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
      resetServer: () => this.viewManager.switchServer(undefined),
      onToggleMainViewDevTools: this.viewManager.toggleViewDevTools,
      onToggleTitleBarDevTools: this.toggleTitleBarViewDevTools,
    }))
    this.win.setMenu(this.appMenu)

    this.registerWinListeners()
    this.registerMenuListeners()

    this.viewManager.createViews(this.win.getSize()) // TODO: check if that's the correct size

    this.titleBarView = new TitleBarView(this.win.getSize(), this.onTitleBarDidFinishLoad)
    this.win.contentView.addChildView(this.titleBarView.getWebView())
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
      this.viewManager.closeAllViews()
      this.titleBarView?.close()
    })
    this.win.on('resize', () => {
      throwIfPropertyUndefined('win', this.win)

      const winSize = this.win.getSize()
      this.viewManager.adjustViewBounds(winSize)
      this.titleBarView?.adjustBounds(winSize)
    })
  }

  private registerMenuListeners = (): void => {
    throwIfPropertyUndefined('appMenu', this.appMenu)

    this.appMenu.on('menu-will-close', () => {
      this.titleBarView?.sendAppMenuClose()
    })
  }

  private toggleTitleBarViewDevTools = (): void => {
    this.titleBarView?.toggleDevTools()
  }

  private onTitleBarDidFinishLoad = (): void => {
    this.titleBarView?.sendServerSwitch(this.viewManager.getCurrServer())
  }

  private onServerSwitch = (server: Server | undefined): void => {
    this.titleBarView?.sendServerSwitch(server)
  }

  private onServerSave = (servers: Server[]): void => {
    this.titleBarView?.sendServerSave(servers)
  }

  private switchWindowView = (oldView: View | undefined, newView: View): void => {
    throwIfPropertyUndefined('win', this.win)
    this.win.contentView.addChildView(newView)
    if (oldView != null)
      this.win.contentView.removeChildView(oldView)
  }

  // IPC functions
  private onToggleAppMenu = (_event: IpcMainEvent): void => {
    this.appMenu?.popup({
      window: this.win,
      x: 18,
      y: 18,
    })
  }
}
