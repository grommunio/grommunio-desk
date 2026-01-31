// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../utils/paths'
import { TITLE_BAR } from '../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../constants/view'
import View from '../interfaces/view'
import { ServerURL } from '../../types/misc'
import { throwIfPropertyUndefined } from '../utils/misc'
import { IS_PRODUCTION } from '../../constants/misc'

export default class MainView implements View {
  private static readonly DEFAULT_HTML_FILE = 'main-main.html'
  private view?: WebContentsView
  private server: ServerURL

  constructor(contentSize: number[], server: ServerURL) {
    this.server = server

    this.create(contentSize, server)
  }

  private load = (server: ServerURL): void => {
    throwIfPropertyUndefined('view', this.view)

    if (server != undefined) {
      this.view.webContents.loadURL(server)
    }
    else {
      if (IS_PRODUCTION)
        this.view.webContents.loadFile(getAppPath(MainView.DEFAULT_HTML_FILE))
      else
        this.view.webContents.loadURL(`${DEV_SERVER_BASE_URL}${MainView.DEFAULT_HTML_FILE}`)
    }
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

  private create = (contentSize: number[], server: ServerURL): void => {
    this.view = new WebContentsView({
      webPreferences: {
        preload: getAppPath('preload.js'),
        // TODO: set (cookies) session partition
      },
    })
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
