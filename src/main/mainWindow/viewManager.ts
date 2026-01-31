// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { ipcMain, IpcMainEvent, View } from 'electron'

import { ServerURL } from '../../types/misc'
import store from '../utils/store'
import MainView from './mainView'
import { CONFIG_SAVE_SERVER } from '../constants/communication'
import { throwIfPropertyUndefined } from '../utils/misc'
import Logger from '@utils/logger'

const logger = new Logger('main/windows/main/mainView')

export default class ViewManager {
  private currView?: MainView
  private windowContentSize?: number[]
  private switchWindowView: (oldView: View | undefined, newView: View) => void
  private serverSwitchListener?: (server: ServerURL) => void

  constructor(
    switchWindowView: (oldView: View | undefined, newView: View) => void,
    serverSwitchListener?: (server: ServerURL) => void,
  ) {
    this.switchWindowView = switchWindowView
    this.serverSwitchListener = serverSwitchListener

    ipcMain.on(CONFIG_SAVE_SERVER, this.onConfigSaveServer)
  }

  private switchCurrView(server: ServerURL): void {
    throwIfPropertyUndefined('windowContentSize', this.windowContentSize)
    const oldWebView = this.currView?.getWebView()
    if (this.currView != null)
      this.currView.close()
    this.currView = new MainView(this.windowContentSize, server)
    this.switchWindowView(oldWebView, this.currView.getWebView())
  }

  createViews = (windowContentSize: number[]): void => {
    logger.verbose('createViews', 'Creating views')
    if (this.currView != null) // TODO: throw error (?)
      return
    this.windowContentSize = windowContentSize
    const server = store.get('server')
    this.switchCurrView(server)
    this.serverSwitchListener?.(server)
  }

  closeAllViews = (): void => {
    this.currView?.close()
  }

  switchServer = (server: ServerURL): void => {
    logger.verbose('load', 'Server:', server)
    if (server === this.currView?.getServer())
      return
    store.set('server', server)
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

  getCurrServer = (): ServerURL => {
    return this.currView?.getServer()
  }

  // IPC functions
  private onConfigSaveServer = (_event: IpcMainEvent, server: ServerURL): void => {
    this.switchServer(server)
  }
}
