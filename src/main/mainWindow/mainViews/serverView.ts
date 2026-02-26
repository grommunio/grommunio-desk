// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { TITLE_BAR } from '../../../constants/window'
import { DEV_TOOLS_OPTIONS } from '../../constants/view'
import { View } from '../../types/misc'
import { Server } from '../../../types/misc'
import { throwIfPropertyUndefined } from '../../utils/misc'

export default class ServerView implements View {
  private view?: WebContentsView
  private server: Server
  private onDidFailLoad?: (server: Server) => void

  constructor(contentSize: number[], server: Server, onDidFailLoad?: (server: Server) => void) {
    this.server = server
    this.onDidFailLoad = onDidFailLoad

    this.create(contentSize)
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.loadURL(this.server.url)
  }

  private registerListeners = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    // prevent website from stopping window closing with beforeunload
    this.view.webContents.on('will-prevent-unload', (e) => {
      e.preventDefault()
    })

    this.view.webContents.setWindowOpenHandler(({ url }: HandlerDetails): WindowOpenHandlerResponse => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    this.view.webContents.on('did-fail-load', () => {
      this.onDidFailLoad?.(this.server)
    })

    // TODO: prevent redirects to external pages
  }

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.setBounds({ x: 0, y: TITLE_BAR.HEIGHT, width: contentSize[0], height: contentSize[1] - TITLE_BAR.HEIGHT })
  }

  private create = (contentSize: number[]): void => {
    // TODO: set (cookies) session partition
    this.view = new WebContentsView()
    this.view.setBackgroundColor('#2a2b30')

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

  getServer(): Server {
    return this.server
  }

  getWebView(): WebContentsView | undefined {
    return this.view
  }
}
