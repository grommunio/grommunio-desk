// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { TITLE_BAR } from '../../../constants/window'
import { DEV_TOOLS_OPTIONS } from '../../constants/view'
import View from '../../interfaces/view'
import { ServerURL } from '../../../types/misc'
import { throwIfPropertyUndefined } from '../../utils/misc'

export default class ServerView implements View {
  private view?: WebContentsView
  private server: ServerURL

  constructor(contentSize: number[], server: string) {
    this.server = server

    this.create(contentSize, server)
  }

  private load = (server: string): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.loadURL(server)
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

    // TODO: prevent redirects to external pages
  }

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.setBounds({ x: 0, y: TITLE_BAR.HEIGHT, width: contentSize[0], height: contentSize[1] - TITLE_BAR.HEIGHT })
  }

  private create = (contentSize: number[], server: string): void => {
    // TODO: set (cookies) session partition
    this.view = new WebContentsView()
    this.view.setBackgroundColor('#2a2b30')

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load(server)
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

  getServer(): ServerURL {
    return this.server
  }

  getWebView(): WebContentsView {
    throwIfPropertyUndefined('view', this.view)
    return this.view
  }
}
