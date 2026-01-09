// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../../utils/utils'
import { TITLE_BAR } from '../../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../../constants/view'
import View from '../../interfaces/view'

export default class TitleBarView implements View<null> {
  private static readonly DEFAULT_HTML_FILE = 'main-titleBar.html'
  private view?: WebContentsView
  private isProduction: boolean

  constructor(isProduction: boolean) {
    this.isProduction = isProduction
  }

  private load = (): void => {
    if (this.view == null)
      return

    if (this.isProduction)
      this.view.webContents.loadFile(getAppPath(TitleBarView.DEFAULT_HTML_FILE))
    else
      this.view.webContents.loadURL(`${DEV_SERVER_BASE_URL}${TitleBarView.DEFAULT_HTML_FILE}`)
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

    this.view.webContents.setWindowOpenHandler((): WindowOpenHandlerResponse => {
      return { action: 'deny' }
    })
  }

  adjustBounds = (contentSize: number[]): void => {
    if (this.view == null)
      return

    this.view.setBounds({ x: 0, y: 0, width: contentSize[0], height: TITLE_BAR.HEIGHT })
  }

  create = (contentSize: number[]): WebContentsView => {
    if (this.view != null)
      return this.view

    this.view = new WebContentsView()

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load()

    return this.view
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
