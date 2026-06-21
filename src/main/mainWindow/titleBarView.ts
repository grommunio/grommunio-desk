// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import { TITLE_BAR } from '../../constants/window'
import View from './view'
import { ON_APP_MENU_CLOSE, ON_SERVER_SWITCH, ON_SERVER_SAVE, ON_DIALOG_CHANGE } from '../constants/communication'
import { sendIpc, throwIfPropertyUndefined } from '../utils/misc'
import { Server } from '../../types/misc'

declare const MAIN_TITLEBAR_WEBPACK_ENTRY: string
declare const MAIN_TITLEBAR_PRELOAD_WEBPACK_ENTRY: string

export default class TitleBarView extends View {
  private onDidFinishLoad?: () => void
  private isServerMenuOpen = false
  private winContentSize?: number[]

  constructor(contentSize: number[], onDidFinishLoad?: () => void) {
    super()
    this.onDidFinishLoad = onDidFinishLoad

    this.create(contentSize)
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.loadURL(MAIN_TITLEBAR_WEBPACK_ENTRY)
  }

  private registerListeners = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    this.view.webContents.setWindowOpenHandler((): WindowOpenHandlerResponse => {
      return { action: 'deny' }
    })

    this.view.webContents.on('did-finish-load', () => {
      this.onDidFinishLoad?.()
    })
  }

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)

    this.winContentSize = contentSize
    this.view.setBounds({
      x: 0,
      y: 0,
      width: contentSize[0],
      height: this.isServerMenuOpen ? contentSize[1] : TITLE_BAR.HEIGHT,
    })
  }

  private create = (contentSize: number[]): void => {
    this.view = new WebContentsView({
      webPreferences: {
        preload: MAIN_TITLEBAR_PRELOAD_WEBPACK_ENTRY,
      },
    })
    this.view.setBackgroundColor('#00000000')

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load()
  }

  setServerMenuOpen = (isOpen: boolean): void => {
    this.isServerMenuOpen = isOpen
    if (this.winContentSize != null)
      this.adjustBounds(this.winContentSize)
  }

  // IPC functions
  sendAppMenuClose = (): void => {
    sendIpc(this.view, ON_APP_MENU_CLOSE)
  }

  sendServerSwitch = (server: Server | undefined): void => {
    sendIpc(this.view, ON_SERVER_SWITCH, server)
  }

  sendServerSave = (servers: Server[]): void => {
    sendIpc(this.view, ON_SERVER_SAVE, servers)
  }

  sendDialogChange = (isDialogOpen: boolean): void => {
    sendIpc(this.view, ON_DIALOG_CHANGE, isDialogOpen)
  }
}
