// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainEvent, View as ElectronView } from 'electron'

import { Server, ServerOptions } from '../../types/misc'
import store from '../utils/store'
import ServerView from './mainViews/serverView'
import StartView from './mainViews/startView'
import { ADD_SERVER, SAVE_SERVER_AND_RELOAD, SWITCH_SERVER } from '../constants/communication'
import { throwIfPropertyUndefined } from '../utils/misc'
import Logger from '@utils/logger'
import View from '../interfaces/view'

const logger = new Logger('main/mainWindow/viewManager')

export default class ViewManager {
  private currView?: View
  private servers: Server[]
  private windowContentSize?: number[]
  private switchWindowView: (oldView: ElectronView | undefined, newView: ElectronView) => void
  private serverSwitchListener?: (server: Server | undefined) => void
  private serverSaveListener?: (servers: Server[]) => void

  constructor(
    switchWindowView: (oldView: ElectronView | undefined, newView: ElectronView) => void,
    serverSwitchListener?: (server: Server | undefined) => void,
    serverSaveListener?: (servers: Server[]) => void,
  ) {
    this.servers = store.get('servers')
    this.switchWindowView = switchWindowView
    this.serverSwitchListener = serverSwitchListener
    this.serverSaveListener = serverSaveListener

    ipcMain.on(ADD_SERVER, this.onAddServer)
    ipcMain.on(SAVE_SERVER_AND_RELOAD, this.onSaveServerAndReload)
    ipcMain.on(SWITCH_SERVER, this.onSwitchServer)
  }

  private switchCurrView(server: Server | undefined): void {
    throwIfPropertyUndefined('windowContentSize', this.windowContentSize)
    const oldWebView = this.currView?.getWebView()
    if (this.currView != null)
      this.currView.close()
    if (server == null)
      this.currView = new StartView(this.windowContentSize)
    else
      this.currView = new ServerView(this.windowContentSize, server)
    this.switchWindowView(oldWebView, this.currView.getWebView())
  }

  createViews = (windowContentSize: number[]): void => {
    logger.verbose('createViews', 'Creating views')
    if (this.currView != null) // TODO: throw error (?)
      return
    this.windowContentSize = windowContentSize
    const server = store.get('lastUsedServer')
    this.switchCurrView(server)
    this.serverSwitchListener?.(server)
  }

  closeAllViews = (): void => {
    this.currView?.close()
  }

  switchServer = (server: Server | undefined): void => {
    logger.verbose('switchServer', 'Server:', server)
    if ((this.currView instanceof StartView && (server == null))
      || (this.currView instanceof ServerView && server === this.currView.getServer())) {
      logger.debug('switchServer', 'Canceling switchServer-operation, because server is already loaded')
      return
    }
    if (server != null && this.servers.find((srv: Server) => srv.id === server.id) == null) {
      logger.error('switchServer', `Could not find server ${server.url} with id ${server.id}`)
      return
    }
    store.set('lastUsedServer', server)
    this.switchCurrView(server)
    this.serverSwitchListener?.(server)
  }

  toggleViewDevTools = (): void => {
    throwIfPropertyUndefined('currView', this.currView)
    this.currView.toggleDevTools()
  }

  adjustViewBounds = (contentSize: number[]): void => {
    this.windowContentSize = contentSize
    this.currView?.adjustBounds(contentSize)
  }

  getCurrServer = (): Server | undefined => {
    return this.currView instanceof ServerView ? this.currView.getServer() : undefined
  }

  // IPC functions
  private onAddServer = (_event: IpcMainEvent): void => {
    this.switchServer(undefined)
  }

  private onSaveServerAndReload = (_event: IpcMainEvent, server: ServerOptions): void => {
    const id = this.servers.length == 0 ? 0 : this.servers[this.servers.length - 1].id + 1
    if (this.servers.find((srv: Server) => srv.id === id) != null)
      throw new Error(`New server id ${id} already exists`)
    const newServer: Server = {
      ...server,
      id,
    }
    logger.info('onSaveServerAndReload', 'Add server', newServer)
    this.servers.push(newServer)
    store.set('servers', this.servers)
    this.serverSaveListener?.(this.servers)
    this.switchServer(newServer)
  }

  private onSwitchServer = (_event: IpcMainEvent, server: Server): void => {
    this.switchServer(server)
  }
}
