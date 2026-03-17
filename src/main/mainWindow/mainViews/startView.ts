// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import { TITLE_BAR } from '../../../constants/window'
import { BACKGROUND_COLOR, DEV_TOOLS_OPTIONS } from '../../constants/view'
import { View } from '../../types/misc'
import { throwIfPropertyUndefined } from '../../utils/misc'

declare const MAIN_START_WEBPACK_ENTRY: string
declare const MAIN_START_PRELOAD_WEBPACK_ENTRY: string

export default class StartView implements View {
  private view?: WebContentsView

  constructor(contentSize: number[]) {
    this.create(contentSize)
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.loadURL(MAIN_START_WEBPACK_ENTRY)
  }

  private registerListeners = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    this.view.webContents.setWindowOpenHandler((): WindowOpenHandlerResponse => {
      return { action: 'deny' }
    })
  }

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.setBounds({ x: 0, y: TITLE_BAR.HEIGHT, width: contentSize[0], height: contentSize[1] - TITLE_BAR.HEIGHT })
  }

  private create = (contentSize: number[]): void => {
    this.view = new WebContentsView({
      webPreferences: {
        preload: MAIN_START_PRELOAD_WEBPACK_ENTRY,
      },
    })
    this.view.setBackgroundColor(BACKGROUND_COLOR)

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load()
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

  getWebView(): WebContentsView | undefined {
    return this.view
  }
}
