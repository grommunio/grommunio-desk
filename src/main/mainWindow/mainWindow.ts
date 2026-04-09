// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { BaseWindow, Menu, ipcMain, IpcMainEvent, View as ElectronView } from 'electron'

import store from '../utils/store'
import { buildAppMenuTemplate } from '../utils/appMenu'
import TitleBarView from './titleBarView'
import { TITLE_BAR } from '../../constants/window'
import { SET_TITLE_BAR_SERVER_MENU_OPEN, TOGGLE_APP_MENU, HANDLE_DIALOG_BUTTON, OPEN_DIALOG, EXIT_DIALOG } from '../constants/communication'
import { Server } from '../../types/misc'
import { throwIfPropertyUndefined } from '../utils/misc'
import ViewManager from './viewManager'
import { APP_PRODUCT_NAME } from '../constants/app'
import { systemPlatform } from '../constants/system'
import { BACKGROUND_COLOR } from '../constants/view'
import DialogView from './mainViews/dialogView'
import { UserDialog, UserDialogButton } from '../../types/dialog'
import Logger from '@utils/logger'
import { getExtraResourcesPath } from '../utils/paths'

const logger = new Logger('main/mainWindow/mainWindow')

export default class MainWindow {
  private win?: BaseWindow
  private appMenu?: Menu
  private viewManager: ViewManager
  private titleBarView?: TitleBarView
  private dialogView?: DialogView

  constructor() {
    this.viewManager = new ViewManager(
      this.addWindowView,
      this.removeWindowView,
      this.createDialog,
      this.isDialogActive,
      this.onServerSwitch,
      this.onServerSave,
    )

    ipcMain.on(TOGGLE_APP_MENU, this.onToggleAppMenu)
    ipcMain.on(SET_TITLE_BAR_SERVER_MENU_OPEN, this.onSetTitleBarServerMenuOpen)
    ipcMain.on(HANDLE_DIALOG_BUTTON, this.onHandleDialogButton)
    ipcMain.on(OPEN_DIALOG, this.onOpenDialog)
    ipcMain.on(EXIT_DIALOG, this.onExitDialog)

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
      title: APP_PRODUCT_NAME,
      backgroundColor: BACKGROUND_COLOR,
      titleBarStyle: 'hidden',
      ...(systemPlatform !== 'mac'
        ? { titleBarOverlay:
            {
              color: TITLE_BAR.BACKGROUND_COLOR,
              symbolColor: TITLE_BAR.COLOR,
              height: TITLE_BAR.HEIGHT,
            },
          }
        : {}
      ),
      ...(systemPlatform === 'linux'
        ? { icon: getExtraResourcesPath('app_icon.png') }
        : {}
      ),
      show: false,
    })

    this.createAppMenu(this.viewManager.getServers())

    this.registerWinListeners()
    this.registerMenuListeners()

    const winSize = this.getWinContentSize()

    this.titleBarView = new TitleBarView(winSize, this.onTitleBarDidFinishLoad)
    const titleBarWebView = this.titleBarView.getWebView()
    throwIfPropertyUndefined('titleBarWebView', titleBarWebView)
    this.addWindowView(titleBarWebView)

    this.viewManager.createViews(winSize) // TODO: check if that's the correct size
  }

  show = (): void => {
    throwIfPropertyUndefined('win', this.win) // TODO: catch exceptions in main process and write to log

    this.win.show()
  }

  private registerWinListeners = (): void => {
    throwIfPropertyUndefined('win', this.win)

    this.win.on('close', () => {
      throwIfPropertyUndefined('win', this.win)
      store.set('windowSize', this.getWinContentSize())
    })
    this.win.on('closed', () => {
      this.viewManager.closeCurrView()
      this.titleBarView?.close()
      this.dialogView?.close()
      this.dialogView = undefined
      this.win = undefined
    })
    this.win.on('resize', () => {
      throwIfPropertyUndefined('win', this.win)

      const winSize = this.getWinContentSize()
      this.viewManager.adjustViewBounds(winSize)
      this.titleBarView?.adjustBounds(winSize)
      this.dialogView?.adjustBounds(winSize)
    })
  }

  private registerMenuListeners = (): void => {
    throwIfPropertyUndefined('appMenu', this.appMenu)

    this.appMenu.on('menu-will-close', () => {
      this.titleBarView?.sendAppMenuClose()
    })
  }

  private createAppMenu = (servers: Server[]): void => {
    throwIfPropertyUndefined('win', this.win)

    const isMac = systemPlatform === 'mac'
    this.appMenu = Menu.buildFromTemplate(buildAppMenuTemplate({
      isMac,
      servers,
      addServer: () => this.viewManager.switchServer(undefined),
      switchServer: this.viewManager.switchServer,
      toggleMainViewDevTools: this.viewManager.toggleMainViewDevTools,
      toggleTitleBarViewTools: this.toggleTitleBarViewDevTools,
      toggleDialogViewDevTools: () => this.dialogView?.toggleDevTools(),
    }))
    this.win.setMenu(this.appMenu)
    Menu.setApplicationMenu(this.appMenu)
  }

  private toggleTitleBarViewDevTools = (): void => {
    this.titleBarView?.toggleDevTools()
  }

  private onTitleBarDidFinishLoad = (): void => {
    this.titleBarView?.sendServerSwitch(this.viewManager.getCurrServer())
    this.titleBarView?.sendServerSave(this.viewManager.getServers())
  }

  private onServerSwitch = (server: Server | undefined): void => {
    this.titleBarView?.sendServerSwitch(server)
  }

  private onServerSave = (servers: Server[]): void => {
    this.createAppMenu(servers)
    this.titleBarView?.sendServerSave(servers)
  }

  private addWindowView = (newView: ElectronView): void => {
    throwIfPropertyUndefined('win', this.win)
    this.win.contentView.addChildView(newView)
    const titleBarWebView = this.titleBarView?.getWebView()
    if (titleBarWebView != null)
      this.win.contentView.addChildView(titleBarWebView)
    if (this.dialogView != null)
      this.win.contentView.addChildView(this.dialogView.getWebView())
  }

  private removeWindowView = (view: ElectronView): void => {
    throwIfPropertyUndefined('win', this.win)
    this.win.contentView.removeChildView(view)
  }

  focus = (): void => {
    throwIfPropertyUndefined('win', this.win)

    if (this.win.isMinimized())
      this.win.restore()
    this.win.focus()
  }

  isWindowDefined = (): boolean => {
    return this.win != null
  }

  private getWinContentSize = (): number[] => {
    throwIfPropertyUndefined('win', this.win)
    return this.win.getSize()
  }

  private createDialog = (userDialog: UserDialog): void => {
    if (this.dialogView != null) {
      logger.warn('createDialog', 'Canceling createDialog-operation because a dialog is already active', userDialog)
      return
    }
    this.dialogView = new DialogView(this.getWinContentSize(), userDialog)
    this.addWindowView(this.dialogView.getWebView())
    this.titleBarView?.sendDialogChange(true)
  }

  private closeDialog = (): void => {
    if (this.dialogView != null) {
      this.removeWindowView(this.dialogView.getWebView())
      this.dialogView.close()
      this.dialogView = undefined
      this.titleBarView?.sendDialogChange(false)
    }
  }

  private isDialogActive = (): boolean => {
    return this.dialogView != null
  }

  // IPC functions
  private onToggleAppMenu = (_event: IpcMainEvent): void => {
    this.appMenu?.popup({
      window: this.win,
      x: 18,
      y: 18,
    })
  }

  private onSetTitleBarServerMenuOpen = (_event: IpcMainEvent, isOpen: boolean): void => {
    this.titleBarView?.setServerMenuOpen(isOpen)
  }

  private onHandleDialogButton = (_event: IpcMainEvent, button: UserDialogButton): void => {
    this.closeDialog()
    this.viewManager.handleDialogButton(button)
  }

  private onOpenDialog = (_event: IpcMainEvent, userDialog: UserDialog): void => {
    this.createDialog(userDialog)
  }

  private onExitDialog = (_event: IpcMainEvent): void => {
    this.closeDialog()
  }
}
