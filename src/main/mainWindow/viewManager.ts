// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainEvent, View as ElectronView } from 'electron'

import { Server, ServerOptions } from '../../types/misc'
import { UserDialog, UserDialogButton } from '../../types/dialog'
import { View } from '../types/misc'
import { ADD_SERVER, HANDLE_DIALOG_BUTTON, LOAD_NEW_SERVER, SWITCH_SERVER } from '../constants/communication'
import Logger from '@utils/logger'
import { throwIfPropertyUndefined } from '../utils/misc'
import store from '../utils/store'
import ServerView from './mainViews/serverView'
import StartView from './mainViews/startView'
import DialogView from './mainViews/dialogView'

const logger = new Logger('main/mainWindow/viewManager')

export default class ViewManager {
  private currView?: View
  private serverViews: Map<Server['id'], ServerView>
  private servers: Server[]
  private windowContentSize?: number[]
  private dialogView?: DialogView
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
    ipcMain.on(LOAD_NEW_SERVER, this.onLoadNewServer)
    ipcMain.on(SWITCH_SERVER, this.onSwitchServer)
    ipcMain.on(HANDLE_DIALOG_BUTTON, this.onHandleDialogButton)
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

  private createServerView(server: Server | undefined): [View, boolean] { // boolean return value indicates, if the server was loaded from scratch (so it was not cached, except StartView)
    throwIfPropertyUndefined('windowContentSize', this.windowContentSize)
    if (server == null) {
      return [new StartView(this.windowContentSize), false]
    }
    else {
      let serverView = this.serverViews.get(server.id)
      if (serverView) {
        logger.debug('createServerView', `Loading ServerView for server ${server.id} from cache`)
        serverView.adjustBounds(this.windowContentSize)
        return [serverView, false]
      }
      else {
        serverView = new ServerView(this.windowContentSize, server, this.onServerViewDidFinishLoadSuccly, this.onServerViewDidFailLoad)
        this.serverViews.set(server.id, serverView)
        return [serverView, true]
      }
    }
  }

  switchServer = (server: Server | undefined, skipServerStoreCheck = false): void => {
    logger.verbose('switchServer', 'Server:', server)
    if ((this.currView instanceof StartView && (server == null))
      || (this.currView instanceof ServerView && server?.id === this.currView.getServer().id)) {
      logger.debug('switchServer', 'Canceling switchServer-operation, because server is already loaded')
      return
    }
    if (this.dialogView != null) {
      logger.debug('switchServer', 'Canceling switchServer-operation due to active dialog') // TODO: use log.scope (?)
      return
    }
    if (!skipServerStoreCheck && server != null && this.servers.find((srv: Server) => srv.id === server.id) == null) {
      logger.error('switchServer', `Could not find server ${server.url} with id ${server.id}`)
      return
    }
    const [view, loadedFromSratch] = this.createServerView(server)
    this.switchCurrView(view)
    if (!loadedFromSratch) // for new (loaded from scratch) servers, do not set lastUsedServer until the server has loaded successfully (see onServerViewDidFinishLoadSuccly)
      store.set('lastUsedServer', server)
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

  private createDialog = (dialog: UserDialog): void => {
    throwIfPropertyUndefined('windowContentSize', this.windowContentSize)
    if (this.dialogView != null)
      return
    this.dialogView = new DialogView(this.windowContentSize, dialog)
    this.addWindowView(this.dialogView.getWebView())
  }

  private closeDialog = (): void => {
    const dialogWebView = this.dialogView?.getWebView()
    if (this.dialogView != null && dialogWebView != null) {
      this.removeWindowView(dialogWebView) // TODO: move webView == null check to addWindowView / removeWindowView (?)
      this.dialogView.close()
      this.dialogView = undefined
    }
  }

  // Closes currView (if is not an instance of ServerView or failed to load) and dialogView.
  // Note that this method is used when the BrowserWindow closes. Therefore, it will not remove the views from the window.
  closeCurrView = (): void => {
    // e.g. when currView is an instance of StartView
    if (this.currView != null && !(this.currView instanceof ServerView)) {
      logger.debug('closeCurrView', 'currView is closed (because currView is not an instance of ServerView)')
      this.currView.close()
    }
    // when currView failed to load, it is / should be already included in serverViews
    else if (this.currView != null && this.serverViews.values().find(view => view === this.currView)?.hasFailedLoading()) {
      logger.debug('closeCurrView', 'currView is closed (because currView failed to load)')
      this.serverViews.delete(this.currView.getServer().id)
      this.currView.close()
    }
    this.currView = undefined // necessary because switchCurrView needs to re-add the currView to BrowserWindow
    this.dialogView?.close()
    this.dialogView = undefined
  }

  toggleMainViewDevTools = (): void => {
    throwIfPropertyUndefined('currView', this.currView)
    this.currView.toggleDevTools()
  }

  toggleDialogViewDevTools = (): void => {
    this.dialogView?.toggleDevTools()
  }

  adjustViewBounds = (contentSize: number[]): void => {
    this.windowContentSize = contentSize
    this.currView?.adjustBounds(contentSize)
    this.dialogView?.adjustBounds(contentSize)
  }

  getCurrServer = (): Server | undefined => {
    return this.currView instanceof ServerView ? this.currView.getServer() : undefined
  }

  getServers = (): Server[] => {
    return this.servers
  }

  private addServerToStore = (server: Server): void => {
    if (this.servers.find((srv: Server) => srv.id === server.id) != null)
      return
    logger.info('addServerToStore', 'Add server', server)
    this.servers.push(server)
    store.set('servers', this.servers)
    this.serverSaveListener?.(this.servers)
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

  private onServerViewDidFinishLoadSuccly = (server: Server): void => {
    logger.debug('onServerViewDidFinishLoadSuccly', 'Finished loading of server successfully', server)
    this.addServerToStore(server)
    store.set('lastUsedServer', server)
  }

  private onServerViewDidFailLoad = (server: Server): void => {
    logger.info('onServerViewDidFailLoad', 'Loading of server failed', server)
    this.createDialog({ text: 'loadFailed', textArgs: { url: server.url, interpolation: { escapeValue: false } }, buttons: [{ name: 'returnToStartPage', triggerOnEnter: true }] })
  }

  // IPC functions
  private onAddServer = (_event: IpcMainEvent): void => {
    this.switchServer(undefined)
  }

  private onLoadNewServer = (_event: IpcMainEvent, server: ServerOptions): void => {
    const id = store.get('serverIdCount')
    store.set('serverIdCount', id + 1)
    if (this.servers.find((srv: Server) => srv.id === id) != null)
      throw new Error(`New server id ${id} already exists`)
    const newServer: Server = {
      ...server,
      id,
    }
    this.switchServer(newServer, true)
  }

  private onSwitchServer = (_event: IpcMainEvent, server: Server): void => {
    this.switchServer(server)
  }

  private onHandleDialogButton = (_event: IpcMainEvent, button: UserDialogButton): void => {
    this.closeDialog()
    if (button.name === 'returnToStartPage') {
      if (this.currView instanceof ServerView) {
        this.serverViews.delete(this.currView.getServer().id)
      }
      else {
        logger.warn('onHandleDialogButton', 'currView is not a ServerView')
      }
      this.switchServer(undefined)
    }
  }
}
