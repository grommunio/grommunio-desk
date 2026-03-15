// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../utils/paths'
import { TITLE_BAR } from '../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../constants/view'
import { View } from '../types/misc'
import { ON_APP_MENU_CLOSE, ON_SERVER_SWITCH, ON_SERVER_SAVE } from '../constants/communication'
import { sendIpc, throwIfPropertyUndefined } from '../utils/misc'
import { Server } from '../../types/misc'
import { IS_PRODUCTION } from '../../constants/misc'

export default class TitleBarView implements View {
  private static readonly DEFAULT_HTML_FILE = 'main-titleBar.html'
  private view?: WebContentsView
  private onDidFinishLoad?: () => void
  private isServerMenuOpen = false
  private winContentSize?: number[]

  constructor(contentSize: number[], onDidFinishLoad?: () => void) {
    this.onDidFinishLoad = onDidFinishLoad

    this.create(contentSize)
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    if (IS_PRODUCTION)
      this.view.webContents.loadFile(getAppPath(TitleBarView.DEFAULT_HTML_FILE))
    else
      this.view.webContents.loadURL(`${DEV_SERVER_BASE_URL}${TitleBarView.DEFAULT_HTML_FILE}`)
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
        preload: getAppPath('preload.js'),
      },
    })
    this.view.setBackgroundColor('#00000000')

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load()
  }

  close = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.close()
    this.view = undefined
  }

  toggleDevTools = (): void => {
    throwIfPropertyUndefined('view', this.view)

    if (!this.view.webContents.isDevToolsOpened())
      this.view.webContents.openDevTools(DEV_TOOLS_OPTIONS)
    else
      this.view.webContents.closeDevTools()
  }

  getWebView(): WebContentsView | undefined {
    return this.view
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
}
