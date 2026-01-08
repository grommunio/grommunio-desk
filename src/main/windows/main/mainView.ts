// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../../utils/utils'
import { TITLE_BAR_HEIGHT } from '../../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../../constants/view'

export default class MainView {
  private static readonly DEFAULT_HTML_FILE = 'main-main.html'
  private view?: WebContentsView
  private isProduction: boolean

  constructor(isProduction: boolean) {
    this.isProduction = isProduction
  }

  private load = (server: string | undefined): void => {
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

    this.view.setBounds({ x: 0, y: 0, width: contentSize[0], height: contentSize[1] - TITLE_BAR_HEIGHT })
  }

  create = (server: string | undefined, contentSize: number[]): WebContentsView => {
    if (this.view != null)
      return this.view

    this.view = new WebContentsView({
      webPreferences: {
        preload: getAppPath('preload.js'),
      },
    })

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load(server)

    if (!this.isProduction)
      this.view.webContents.openDevTools(DEV_TOOLS_OPTIONS)

    return this.view
  }

  reload = (server: string | undefined): void => {
    this.load(server)
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
