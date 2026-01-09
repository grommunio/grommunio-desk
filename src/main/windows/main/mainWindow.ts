// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { BaseWindow, Menu } from 'electron'

import store from '../../utils/store'
import { buildAppMenuTemplate } from '../../utils/appMenu'
import MainView from './mainView'
import TitleBarView from './titleBar'
import { TITLE_BAR } from '../../../constants/window'

type Server = string | undefined
export default class MainWindow {
  private win?: BaseWindow
  private mainView?: MainView
  private titleBarView?: TitleBarView
  private server: Server
  private isProduction: boolean

  constructor(isProduction: boolean, server: Server) {
    this.isProduction = isProduction
    this.server = server
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
      onSwitchServer: this.switchServer,
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

  private switchServer = (): void => {
    store.set('server', undefined)
    this.server = undefined
    this.mainView?.reload({ server: undefined })
  }

  reloadMainView = (server: Server): void => {
    this.server = server
    this.mainView?.reload({ server: this.server })
  }

  private toggleMainViewDevTools = (): void => {
    this.mainView?.toggleDevTools()
  }

  private toggleTitleBarViewDevTools = (): void => {
    this.titleBarView?.toggleDevTools()
  }
}
