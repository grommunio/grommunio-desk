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
  private serverViews: Record<Server['id'], ServerView>
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
    this.serverViews = {}

    ipcMain.on(ADD_SERVER, this.onAddServer)
    ipcMain.on(SAVE_SERVER_AND_RELOAD, this.onSaveServerAndReload)
    ipcMain.on(SWITCH_SERVER, this.onSwitchServer)
  }

  private switchCurrView(newView: View): void {
    const oldWebView = this.currView?.getWebView()
    if (this.currView != null && !(this.currView instanceof ServerView))
      this.currView.close()
    this.currView = newView
    const currWebView = this.currView.getWebView()
    throwIfPropertyUndefined('currWebView', currWebView)
    this.switchWindowView(oldWebView, currWebView)
  }

  private createServerView(server: Server | undefined): void {
    throwIfPropertyUndefined('windowContentSize', this.windowContentSize)
    if (server == null) {
      this.switchCurrView(new StartView(this.windowContentSize))
    }
    else {
      if (this.serverViews[server.id]) {
        logger.debug('createServerView', `ServerView for server ${server.id} is already preloaded`)
        this.serverViews[server.id].adjustBounds(this.windowContentSize)
        this.switchCurrView(this.serverViews[server.id])
      }
      else {
        const newView = new ServerView(this.windowContentSize, server)
        this.serverViews[server.id] = newView
        this.switchCurrView(newView)
      }
    }
  }

  switchServer = (server: Server | undefined): void => {
    logger.verbose('switchServer', 'Server:', server)
    if ((this.currView instanceof StartView && (server == null))
      || (this.currView instanceof ServerView && server?.id === this.currView.getServer().id)) {
      logger.debug('switchServer', 'Canceling switchServer-operation, because server is already loaded')
      return
    }
    if (server != null && this.servers.find((srv: Server) => srv.id === server.id) == null) {
      logger.error('switchServer', `Could not find server ${server.url} with id ${server.id}`)
      return
    }
    store.set('lastUsedServer', server)
    this.createServerView(server)
    this.serverSwitchListener?.(server)
  }

  createViews = (windowContentSize: number[]): void => {
    logger.debug('createViews', 'Creating views')
    if (this.currView != null) // TODO: throw error (?)
      return
    this.windowContentSize = windowContentSize
    const server = store.get('lastUsedServer')
    logger.verbose('createViews', 'Last used server:', server)
    this.switchServer(server)
  }

  closeAllViews = (): void => {
    Object.values(this.serverViews).forEach(srv => srv.close())
    this.serverViews = {}
    if (this.currView?.getWebView() != null) // e.g. when this.currView instanceof StartView
      this.currView.close()
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

  getServers = (): Server[] => {
    return this.servers
  }

  // IPC functions
  private onAddServer = (_event: IpcMainEvent): void => {
    this.switchServer(undefined)
  }

  private onSaveServerAndReload = (_event: IpcMainEvent, server: ServerOptions): void => {
    const id = store.get('serverIdCount')
    store.set('serverIdCount', id + 1)
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
