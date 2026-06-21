// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import View from '../view'
import { sendIpc, throwIfPropertyUndefined } from '../../utils/misc'
import { UserDialog } from '../../../types/dialog'
import { ON_DIALOG_OPEN } from '../../constants/communication'
import { attachContextMenu } from '../../utils/contextMenu'

declare const MAIN_DIALOG_WEBPACK_ENTRY: string
declare const MAIN_DIALOG_PRELOAD_WEBPACK_ENTRY: string

export default class DialogView extends View {
  private userDialog: UserDialog

  constructor(contentSize: number[], userDialog: UserDialog) {
    super()
    this.userDialog = userDialog
    this.create(contentSize)
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.loadURL(MAIN_DIALOG_WEBPACK_ENTRY)
  }

  private registerListeners = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    this.view.webContents.setWindowOpenHandler((): WindowOpenHandlerResponse => {
      return { action: 'deny' }
    })

    this.view.webContents.on('did-finish-load', () => {
      sendIpc(this.view, ON_DIALOG_OPEN, this.userDialog)
    })

    attachContextMenu(this.view.webContents)
  }

  private create = (contentSize: number[]): void => {
    this.view = new WebContentsView({
      webPreferences: {
        preload: MAIN_DIALOG_PRELOAD_WEBPACK_ENTRY,
        transparent: true,
      },
    })

    this.registerListeners()
    this.adjustBounds(contentSize)
    this.load()
  }
}
