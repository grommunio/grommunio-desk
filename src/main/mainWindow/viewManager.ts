// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainEvent, View as ElectronView } from 'electron'

import { Server, ServerOptions } from '../../types/misc'
import { UserNotificationButton } from '../../types/userNotification'
import { View } from '../types/misc'
import { ADD_SERVER, HANDLE_NOTIFICATION_BUTTON, SAVE_SERVER_AND_RELOAD, SWITCH_SERVER } from '../constants/communication'
import Logger from '@utils/logger'
import { throwIfPropertyUndefined } from '../utils/misc'
import store from '../utils/store'
import ServerView from './mainViews/serverView'
import StartView from './mainViews/startView'
import NotificationView from './mainViews/notificationView'

const logger = new Logger('main/mainWindow/viewManager')

export default class ViewManager {
  private currView?: View
  private serverViews: Map<Server['id'], ServerView>
  private servers: Server[]
  private windowContentSize?: number[]
  private notificationView?: NotificationView
  private addWindowView: (newView: ElectronView) => void
  private removeWindowView: (view: ElectronView) => void
  private serverSwitchListener?: (server: Server | undefined) => void
  private serverSaveListener?: (servers: Server[]) => void

  constructor(
    addWindowView: (newView: ElectronView) => void,
    removeWindowView: (view: ElectronView) => void,
    serverSwitchListener?: (server: Server | undefined) => void,
    serverSaveListener?: (servers: Server[]) => void,
  ) {
    this.servers = store.get('servers')
    this.serverViews = new Map()
    this.addWindowView = addWindowView
    this.removeWindowView = removeWindowView
    this.serverSwitchListener = serverSwitchListener
    this.serverSaveListener = serverSaveListener

    ipcMain.on(ADD_SERVER, this.onAddServer)
    ipcMain.on(SAVE_SERVER_AND_RELOAD, this.onSaveServerAndReload)
    ipcMain.on(SWITCH_SERVER, this.onSwitchServer)
    ipcMain.on(HANDLE_NOTIFICATION_BUTTON, this.onHandleNotificationButton)
  }

  private switchCurrView(newView: View): void {
    const oldWebView = this.currView?.getWebView()
    if (this.currView != null && !(this.currView instanceof ServerView))
      this.currView.close()
    this.currView = newView
    const currWebView = this.currView.getWebView()
    throwIfPropertyUndefined('currWebView', currWebView)
    this.addWindowView(currWebView)
    if (oldWebView != null)
      this.removeWindowView(oldWebView)
  }

  private createServerView(server: Server | undefined): void {
    throwIfPropertyUndefined('windowContentSize', this.windowContentSize)
    if (server == null) {
      this.switchCurrView(new StartView(this.windowContentSize))
    }
    else {
      let serverView = this.serverViews.get(server.id)
      if (serverView) {
        logger.debug('createServerView', `Loading ServerView for server ${server.id} from cache`)
        serverView.adjustBounds(this.windowContentSize)
      }
      else {
        serverView = new ServerView(this.windowContentSize, server)
        this.serverViews.set(server.id, serverView)
      }
      this.switchCurrView(serverView)
    }
  }

  switchServer = (server: Server | undefined): void => {
    logger.verbose('switchServer', 'Server:', server)
    if ((this.currView instanceof StartView && (server == null))
      || (this.currView instanceof ServerView && server?.id === this.currView.getServer().id)) {
      logger.debug('switchServer', 'Canceling switchServer-operation, because server is already loaded')
      return
    }
    if (this.notificationView != null) {
      logger.debug('switchServer', 'Canceling switchServer-operation due to active notification') // TODO: use log.scope (?)
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

  private closeNotification = (): void => {
    this.notificationView?.close()
    this.notificationView = undefined
  }

  closeAllViews = (): void => {
    Object.values(this.serverViews).forEach(srv => srv.close())
    this.serverViews.clear()
    if (this.currView?.getWebView() != null) { // e.g. when this.currView instanceof StartView
      this.currView.close()
      this.currView = undefined
    }
    this.closeNotification()
  }

  toggleMainViewDevTools = (): void => {
    throwIfPropertyUndefined('currView', this.currView)
    this.currView.toggleDevTools()
  }

  toggleNotificationViewDevTools = (): void => {
    throwIfPropertyUndefined('notificationView', this.notificationView)
    this.notificationView.toggleDevTools()
  }

  adjustViewBounds = (contentSize: number[]): void => {
    this.windowContentSize = contentSize
    this.currView?.adjustBounds(contentSize)
    this.notificationView?.adjustBounds(contentSize)
  }

  getCurrServer = (): Server | undefined => {
    return this.currView instanceof ServerView ? this.currView.getServer() : undefined
  }

  getServers = (): Server[] => {
    return this.servers
  }

  private addServerToStore = (server: ServerOptions): Server => {
    const id = store.get('serverIdCount')
    store.set('serverIdCount', id + 1)
    if (this.servers.find((srv: Server) => srv.id === id) != null)
      throw new Error(`New server id ${id} already exists`)
    const newServer: Server = {
      ...server,
      id,
    }
    logger.info('addServerToStore', 'Add server', newServer)
    this.servers.push(newServer)
    store.set('servers', this.servers)
    this.serverSaveListener?.(this.servers)
    return newServer
  }

  // TODO: remove?
  /*
  private removeServerFromStore = (server: Server): boolean => {
    logger.debug('removeServerFromStore', 'Remove server', server)
    const newServers = this.servers.filter(srv => srv.id !== server.id)
    const status = this.servers.length !== newServers.length
    this.servers = newServers
    store.set('servers', this.servers)
    this.serverSaveListener?.(this.servers)
    return status
  } */

  // IPC functions
  private onAddServer = (_event: IpcMainEvent): void => {
    this.switchServer(undefined)
  }

  private onSaveServerAndReload = (_event: IpcMainEvent, server: ServerOptions): void => {
    const newServer = this.addServerToStore(server)
    this.switchServer(newServer)
  }

  private onSwitchServer = (_event: IpcMainEvent, server: Server): void => {
    this.switchServer(server)
  }

  private onHandleNotificationButton = (_event: IpcMainEvent, button: UserNotificationButton): void => {
    this.closeNotification()
    if (button === 'returnToStartPage') {
      if (this.currView instanceof ServerView) {
        this.serverViews.delete(this.currView.getServer().id)
      }
      else {
        logger.warn('onHandleNotificationButton', 'currView is not a ServerView')
      }
      this.switchServer(undefined)
    }
  }
}
