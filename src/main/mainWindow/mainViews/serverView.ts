// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { TITLE_BAR } from '../../../constants/window'
import { BACKGROUND_COLOR, DEV_TOOLS_OPTIONS } from '../../constants/view'
import { View } from '../../types/misc'
import { Server } from '../../../types/misc'
import { throwIfPropertyUndefined } from '../../utils/misc'
import { attachContextMenu } from '../../utils/contextMenu'
import { getServerSessionPartition } from '../../utils/server'

export default class ServerView implements View {
  private view?: WebContentsView
  private server: Server
  private loadingStatus: 'loading' | 'failed' | 'success' = 'loading'
  private onDidFinishLoadSuccly?: (server: Server) => void
  private onDidFailLoad?: (server: Server) => void

  constructor( // TODO: use object for parameters
    contentSize: number[],
    server: Server,
    onDidFinishLoadSuccly?: (server: Server) => void,
    onDidFailLoad?: (server: Server) => void,
    serverUrlParams?: { addPath?: string, search?: string },
  ) {
    this.server = server
    this.onDidFinishLoadSuccly = onDidFinishLoadSuccly
    this.onDidFailLoad = onDidFailLoad

    this.create(contentSize, serverUrlParams)
  }

  private getUrl = (params?: { addPath?: string, search?: string }): string => {
    const url = new URL(this.server.url)
    url.pathname = (url.pathname + (params?.addPath || '')).replace(/\/\/+/, '/')
    url.search = params?.search || ''
    return url.toString()
  }

  private load = (serverUrlParams?: { addPath?: string, search?: string }): void => {
    throwIfPropertyUndefined('view', this.view)
    this.view.webContents.loadURL(this.getUrl(serverUrlParams))
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

    this.view.webContents.on('did-finish-load', () => {
      if (this.loadingStatus == 'loading') {
        this.loadingStatus = 'success'
        this.onDidFinishLoadSuccly?.(this.server)
      }
    })

    this.view.webContents.on('did-fail-load', () => {
      if (this.loadingStatus == 'loading') {
        this.loadingStatus = 'failed'
        this.onDidFailLoad?.(this.server)
      }
    })

    attachContextMenu(this.view.webContents)
  }

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.setBounds({ x: 0, y: TITLE_BAR.HEIGHT, width: contentSize[0], height: contentSize[1] - TITLE_BAR.HEIGHT })
  }

  private create = (contentSize: number[], serverUrlParams?: { addPath?: string, search?: string }): void => {
    this.view = new WebContentsView({
      webPreferences: {
        session: getServerSessionPartition(this.server),
      },
    })
    this.view.setBackgroundColor(BACKGROUND_COLOR)

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load(serverUrlParams)
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

  // Do not implement direct getter method for server to avoid inconsistency issues (e.g. when server name is updated,
  // this.server will contain the outdated name).
  getServerId(): number {
    return this.server.id
  }

  getWebView(): WebContentsView | undefined {
    return this.view
  }

  hasFailedLoading = (): boolean => {
    return this.loadingStatus == 'failed'
  }

  reload = this.load

  hardReload = (): void => {
    throwIfPropertyUndefined('view', this.view)
    this.view.webContents.loadURL(this.getUrl(), { extraHeaders: 'pragma: no-cache\n' })
  }
}
