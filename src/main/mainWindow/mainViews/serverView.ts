// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { BACKGROUND_COLOR } from '../../constants/view'
import View from '../view'
import { Server } from '../../../types/misc'
import { throwIfPropertyUndefined } from '../../utils/misc'
import { attachContextMenu } from '../../utils/contextMenu'
import { getServerSessionPartition } from '../../utils/server'

export default class ServerView extends View {
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
    super()
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

  // Do not implement direct getter method for server to avoid inconsistency issues (e.g. when server name is updated,
  // this.server will contain the outdated name).
  getServerId(): number {
    return this.server.id
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
