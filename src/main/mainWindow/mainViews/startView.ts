// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import { BACKGROUND_COLOR } from '../../constants/view'
import View from '../view'
import { throwIfPropertyUndefined } from '../../utils/misc'
import { attachContextMenu } from '../../utils/contextMenu'

declare const MAIN_START_WEBPACK_ENTRY: string
declare const MAIN_START_PRELOAD_WEBPACK_ENTRY: string

export default class StartView extends View {
  constructor(contentSize: number[]) {
    super()
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

    attachContextMenu(this.view.webContents)
  }

  private create = (contentSize: number[]): void => {
    this.view = new WebContentsView({
      webPreferences: {
        preload: MAIN_START_PRELOAD_WEBPACK_ENTRY,
        spellcheck: true,
      },
    })
    this.view.setBackgroundColor(BACKGROUND_COLOR)

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load()
  }
}
