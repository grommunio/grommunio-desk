// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../../utils/utils'
import { TITLE_BAR } from '../../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../../constants/view'
import View from '../../interfaces/view'
import { ServerURL } from '../../../types/misc'

interface MainViewOptions {
  server: ServerURL
}
export default class MainView implements View<MainViewOptions> {
  private static readonly DEFAULT_HTML_FILE = 'main-main.html'
  private view?: WebContentsView
  private isProduction: boolean

  constructor(isProduction: boolean) {
    this.isProduction = isProduction
  }

  private load = (server: ServerURL): void => {
    if (this.view == null)
      return

    console.log('Server', server)

    if (server != undefined) {
      this.view.webContents.loadURL(server)
    }
    else {
      if (this.isProduction)
        this.view.webContents.loadFile(getAppPath(MainView.DEFAULT_HTML_FILE))
      else
        this.view.webContents.loadURL(`${DEV_SERVER_BASE_URL}${MainView.DEFAULT_HTML_FILE}`)
    }
  }

  private registerListeners = (): void => {
    if (this.view == null)
      return

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
    if (this.view == null)
      return

    this.view.setBounds({ x: 0, y: TITLE_BAR.HEIGHT, width: contentSize[0], height: contentSize[1] - TITLE_BAR.HEIGHT })
  }

  create = (contentSize: number[], options: MainViewOptions): WebContentsView => {
    if (this.view != null)
      return this.view

    this.view = new WebContentsView({
      webPreferences: {
        preload: getAppPath('preload.js'),
      },
    })

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load(options.server)

    if (!this.isProduction)
      this.toggleDevTools()

    return this.view
  }

  reload = (options: MainViewOptions): void => {
    this.load(options.server)
  }

  close = (): void => {
    if (this.view == null)
      return
    this.view.webContents.close()
    this.view = undefined
  }

  toggleDevTools = (): void => {
    if (this.view == null)
      return
    if (!this.view.webContents.isDevToolsOpened())
      this.view.webContents.openDevTools(DEV_TOOLS_OPTIONS)
    else
      this.view.webContents.closeDevTools()
  }
}
