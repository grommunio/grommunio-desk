// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../utils/paths'
import { TITLE_BAR } from '../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../constants/view'
import View from '../interfaces/view'
import { ON_APP_MENU_CLOSE, ON_SERVER_SWITCH } from '../constants/communication'
import { throwIfPropertyUndefined } from '../utils/misc'
import { ServerURL } from '../../types/misc'
import { IS_PRODUCTION } from '../../constants/misc'

export default class TitleBarView implements View<null> {
  private static readonly DEFAULT_HTML_FILE = 'main-titleBar.html'
  private view?: WebContentsView
  private onDidFinishLoad?: () => void

  constructor(onDidFinishLoad?: () => void) {
    this.onDidFinishLoad = onDidFinishLoad
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    if (IS_PRODUCTION)
      this.view.webContents.loadFile(getAppPath(TitleBarView.DEFAULT_HTML_FILE))
    else
      this.view.webContents.loadURL(`${DEV_SERVER_BASE_URL}${TitleBarView.DEFAULT_HTML_FILE}`)
  }

  private registerListeners = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    this.view.webContents.on('will-prevent-unload', (e) => {
      e.preventDefault()
    })

    this.view.webContents.setWindowOpenHandler((): WindowOpenHandlerResponse => {
      return { action: 'deny' }
    })

    this.view.webContents.on('did-finish-load', () => {
      this.onDidFinishLoad?.()
    })
  }

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.setBounds({ x: 0, y: 0, width: contentSize[0], height: TITLE_BAR.HEIGHT })
  }

  create = (contentSize: number[]): WebContentsView => {
    if (this.view != null)
      return this.view

    this.view = new WebContentsView({
      webPreferences: {
        preload: getAppPath('preload.js'),
      },
    })

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load()

    return this.view
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

  // IPC functions
  sendAppMenuClose = (): void => {
    this.view?.webContents.send(ON_APP_MENU_CLOSE)
  }

  sendServerSwitch = (server: ServerURL): void => {
    this.view?.webContents.send(ON_SERVER_SWITCH, server) // TODO: add undefined check (possibly throw an error)
  }
}
