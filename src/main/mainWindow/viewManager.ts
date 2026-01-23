// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { WebContentsView, ipcMain, IpcMainEvent } from 'electron'

import { ServerURL } from '../../types/misc'
import store from '../utils/store'
import MainView from './mainView'
import { CONFIG_SAVE_SERVER } from '../constants/communication'
import { throwIfPropertyUndefined } from '../utils/misc'
import Logger from '@utils/logger'

const logger = new Logger('main/windows/main/mainView')

export default class ViewManager {
  currServer: ServerURL
  currView?: MainView
  serverSwitchListener?: (server: ServerURL) => void

  constructor(serverSwitchListener?: (server: ServerURL) => void) {
    this.serverSwitchListener = serverSwitchListener
    this.currServer = store.get('server')

    ipcMain.on(CONFIG_SAVE_SERVER, this.onConfigSaveServer)
  }

  createView = (contentSize: number[]): WebContentsView => {
    if (this.currView == null)
      this.currView = new MainView()

    logger.verbose('createView', 'Server:', this.currServer)
    return this.currView.create(contentSize, { server: this.currServer })
  }

  closeAllViews = (): void => {
    this.currView?.close()
  }

  switchServer = (server: ServerURL): void => {
    throwIfPropertyUndefined('currView', this.currView)

    if (server === this.currServer)
      return
    logger.verbose('load', 'Server:', server)
    store.set('server', server)
    this.currServer = server
    this.currView.reload({ server })
    this.serverSwitchListener?.(server)
  }

  toggleViewDevTools = (): void => {
    throwIfPropertyUndefined('currView', this.currView)
    this.currView.toggleDevTools()
  }

  adjustViewBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('currView', this.currView)
    this.currView.adjustBounds(contentSize)
  }

  getCurrServer = (): ServerURL => {
    return this.currServer
  }

  // IPC functions
  private onConfigSaveServer = (_event: IpcMainEvent, server: ServerURL): void => {
    this.switchServer(server)
  }
}
