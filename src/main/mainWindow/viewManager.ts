// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainEvent, View as ElectronView } from 'electron'

import { Server, ServerOptions } from '../../types/misc'
import { UserDialog, UserDialogButton } from '../../types/dialog'
import { View } from '../types/misc'
import { ADD_SERVER, LOAD_NEW_SERVER, SWITCH_SERVER } from '../constants/communication'
import Logger from '@utils/logger'
import { throwIfPropertyUndefined } from '../utils/misc'
import store from '../utils/store'
import ServerView from './mainViews/serverView'
import StartView from './mainViews/startView'
import { createDialogObject } from '../../utils/dialog'
import { getServerSessionPartition } from '@utils/server'

const logger = new Logger('main/mainWindow/viewManager')

// TODO: bug: in production mode view.constructor.name does not work (empty string / undefined)
const formatViewToString = (view: View): string => view.constructor.name + (view instanceof ServerView ? `[ ${view.getServer().name} ]` : '')

export default class ViewManager {
  private currView?: View
  private serverViews: Map<Server['id'], ServerView>
  private servers: Server[]
  private windowContentSize?: number[]
  private addViewToMainWindow: (newView: ElectronView) => void
  private removeViewFromMainWindow: (view: ElectronView) => void
  private createDialog: (userDialog: UserDialog) => void
  private isDialogActive: () => boolean
  private serverSwitchListener?: (server: Server | undefined) => void
  private serverSaveListener?: (servers: Server[]) => void

  constructor(
    addViewToMainWindow: (newView: ElectronView) => void,
    removeViewFromMainWindow: (view: ElectronView) => void,
    createDialog: (userDialog: UserDialog) => void,
    isDialogActive: () => boolean,
    serverSwitchListener?: (server: Server | undefined) => void,
    serverSaveListener?: (servers: Server[]) => void,
  ) {
    this.servers = store.get('servers')
    this.serverViews = new Map()
    this.addViewToMainWindow = addViewToMainWindow
    this.removeViewFromMainWindow = removeViewFromMainWindow
    this.createDialog = createDialog
    this.isDialogActive = isDialogActive
    this.serverSwitchListener = serverSwitchListener
    this.serverSaveListener = serverSaveListener

    ipcMain.on(ADD_SERVER, this.onAddServer)
    ipcMain.on(LOAD_NEW_SERVER, this.onLoadNewServer)
    ipcMain.on(SWITCH_SERVER, this.onSwitchServer)
  }

  private addWindowView = (view: View): void => {
    logger.silly('addWindowView', 'Add', formatViewToString(view))
    const webView = view.getWebView()
    throwIfPropertyUndefined('view', webView)
    this.addViewToMainWindow(webView)
  }

  private removeWindowView = (view: View): void => {
    logger.silly('removeWindowView', 'Remove', formatViewToString(view))
    const webView = view.getWebView()
    throwIfPropertyUndefined('view', webView)
    this.removeViewFromMainWindow(webView)
  }

  private switchCurrView(newView: View): void {
    const oldView = this.currView
    this.currView = newView
    this.addWindowView(this.currView)
    if (oldView != null) {
      this.removeWindowView(oldView)
      if (!(oldView instanceof ServerView) || !this.serverViews.has(oldView.getServer().id)) {
        logger.silly('switchCurrView', 'Close', formatViewToString(oldView))
        oldView.close()
      }
    }
  }

  private createServerView(server: Server | undefined, serverUrlParams?: { addPath?: string, search?: string }): [View, boolean] { // boolean return value indicates, if the server was loaded from scratch (so it was not cached, except StartView)
    throwIfPropertyUndefined('windowContentSize', this.windowContentSize)
    if (server == null) {
      return [new StartView(this.windowContentSize), false]
    }
    else {
      let serverView = this.serverViews.get(server.id)
      if (serverView) {
        logger.debug('createServerView', `Loading ServerView for server ${server.id} from cache`)
        serverView.adjustBounds(this.windowContentSize)
        if (serverUrlParams != null)
          serverView.reload(serverUrlParams)
        return [serverView, false]
      }
      else {
        serverView = new ServerView(this.windowContentSize, server, this.onServerViewDidFinishLoadSuccly, this.onServerViewDidFailLoad, serverUrlParams)
        this.serverViews.set(server.id, serverView)
        return [serverView, true]
      }
    }
  }

  switchServer = (server: Server | undefined, skipServerStoreCheck = false, serverUrlParams?: { addPath?: string, search?: string }): void => {
    if (serverUrlParams == null)
      logger.verbose('switchServer', 'Server:', server)
    else
      logger.verbose('switchServer', 'Server with params:', server, serverUrlParams)
    if ((this.currView instanceof StartView && (server == null))
      || (this.currView instanceof ServerView && server?.id === this.currView.getServer().id)) {
      if (serverUrlParams != null && this.currView instanceof ServerView) {
        this.currView.reload(serverUrlParams)
        logger.debug('switchServer', 'Reloading server with params, because server is already loaded')
      }
      else {
        logger.debug('switchServer', 'Canceling switchServer-operation, because server is already loaded')
      }
      return
    }
    if (this.isDialogActive()) {
      logger.debug('switchServer', 'Canceling switchServer-operation due to active dialog') // TODO: use log.scope (?)
      return
    }
    // TODO: add consistency check that server object has same properties as stored server with same id
    if (!skipServerStoreCheck && server != null && this.servers.find((srv: Server) => srv.id === server.id) == null) {
      logger.error('switchServer', `Could not find server ${server.url} with id ${server.id}`)
      return
    }
    const [view, loadedFromScratch] = this.createServerView(server, serverUrlParams)
    this.switchCurrView(view)
    if (!loadedFromScratch) // for new (loaded from scratch) servers, do not set lastUsedServer until the server has loaded successfully (see onServerViewDidFinishLoadSuccly)
      store.set('lastUsedServerId', server?.id)
    this.serverSwitchListener?.(server)
  }

  createViews = (windowContentSize: number[]): void => {
    logger.debug('createViews', 'Creating views')
    if (this.currView != null) // TODO: throw error (?)
      return
    this.windowContentSize = windowContentSize
    const serverId = store.get('lastUsedServerId')
    const server = serverId == null ? undefined : this.servers.find(srv => srv.id === serverId)
    logger.verbose('createViews', 'Last used server:', server)
    if (serverId != null && server == null)
      logger.error('createViews', `Could not find server with id ${serverId}`)
    this.switchServer(server)
  }

  // Closes currView (if is not an instance of ServerView or failed to load) and dialogView.
  // Note that this method is used when the window closes. Therefore, it will not remove the views from the window.
  closeCurrView = (): void => {
    // e.g. when currView is an instance of StartView
    if (this.currView != null && !(this.currView instanceof ServerView)) {
      logger.debug('closeCurrView', 'Close', formatViewToString(this.currView))
      this.currView.close()
    }
    // when currView failed to load, it is / should be already included in serverViews
    else if (this.currView != null && Array.from(this.serverViews.values()).find(view => view === this.currView)?.hasFailedLoading()) {
      logger.debug('closeCurrView', `Close ${formatViewToString(this.currView)} because it failed to load`)
      this.serverViews.delete(this.currView.getServer().id)
      this.currView.close()
    }
    this.currView = undefined // necessary because switchCurrView needs to re-add the currView to the window when the window is reopened
  }

  toggleMainViewDevTools = (): void => {
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

  private addServerToStore = (server: Server): void => {
    if (this.servers.find((srv: Server) => srv.id === server.id) != null)
      return
    logger.info('addServerToStore', 'Add server', server)
    this.servers.push(server)
    store.set('servers', this.servers)
    this.serverSaveListener?.(this.servers)
  }

  private removeServerFromStore = (server: Server): boolean => {
    logger.debug('removeServerFromStore', 'Remove server', server)
    const newServers = this.servers.filter(srv => srv.id !== server.id)
    const status = this.servers.length !== newServers.length
    this.servers = newServers
    store.set('servers', this.servers)
    if (status)
      getServerSessionPartition(server).clearData()
    this.serverSaveListener?.(this.servers)
    return status
  }

  private updateServerInStore = (server: Server, updateParams: Partial<ServerOptions>): void => {
    const storedServer = this.servers.find((srv: Server) => srv.id === server.id)
    if (storedServer == null) {
      logger.error('updateServerInStore', 'Server could not be updated in store because it does not exist there')
      return
    }
    logger.debug('updateServerInStore', 'Update server', storedServer, updateParams)
    Object.assign(storedServer, updateParams)
    store.set('servers', this.servers)
    this.serverSaveListener?.(this.servers)

    if (this.currView instanceof ServerView && this.currView.getServer().id === server.id) {
      store.set('lastUsedServerId', storedServer.id)
      this.serverSwitchListener?.(storedServer)
    }
  }

  private onServerViewDidFinishLoadSuccly = (server: Server): void => {
    logger.debug('onServerViewDidFinishLoadSuccly', 'Finished loading of server successfully', server)
    this.addServerToStore(server)
    store.set('lastUsedServerId', server.id)
  }

  private onServerViewDidFailLoad = (server: Server): void => {
    logger.info('onServerViewDidFailLoad', 'Loading of server failed', server)
    this.createDialog(createDialogObject({ type: 'confirm.loadFailed', args: { url: server.url } }))
  }

  private openMailtoUrl = (server: Server, url: string): void => {
    this.switchServer(server, undefined, { search: `action=mailto&to=${url}` })
  }

  handleDialogButton = (button: UserDialogButton<false>): void => {
    if (button.type === 'confirm.returnToStartPage') {
      if (this.currView instanceof ServerView) {
        this.serverViews.delete(this.currView.getServer().id) // thereafter currView is closed in switchServer
      }
      else {
        logger.warn('handleDialogButton', 'currView is not a ServerView')
      }
      this.switchServer(undefined)
    }
    else if (button.type === 'confirm.removeServer') {
      if (this.currView instanceof ServerView && this.currView.getServer().id === button.callbackParams.server.id) {
        this.serverViews.delete(this.currView.getServer().id) // thereafter currView is closed in switchServer
        this.switchServer(undefined)
      }
      if (!this.removeServerFromStore(button.callbackParams.server))
        logger.warn('handleDialogButton', 'Server could not be removed from store because it does not exist there')
    }
    else if (button.type === 'select.selectMailtoServer') {
      this.openMailtoUrl(button.selection, button.callbackParams.mailtoUrl)
    }
    else if (button.type === 'input.editServerName') {
      this.updateServerInStore(button.callbackParams.server, button.input)
    }
  }

  handleMailtoUrl = (url: string): void => {
    const servers = this.servers.filter(srv => srv.system?.type === 'web')
    if (servers.length === 0)
      this.createDialog(createDialogObject({ type: 'confirm.noMailtoServerFound', args: { mailtoUrl: url } }))
    else if (servers.length === 1)
      this.openMailtoUrl(servers[0], url)
    else
      this.createDialog(createDialogObject({ type: 'select.mailto', args: { mailtoUrl: url, servers: servers.map(srv => ({ label: srv.name, value: srv })) } }))
  }

  reloadCurrServerView = (hardReload: boolean): void => {
    if (!(this.currView instanceof ServerView))
      return
    if (hardReload) {
      logger.silly('reloadCurrServerView', 'Hard-Reloading', this.currView.getServer())
      this.currView.hardReload()
    }
    else {
      logger.silly('reloadCurrServerView', 'Reloading', this.currView.getServer())
      this.currView.reload()
    }
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
}
