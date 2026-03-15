// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../../utils/paths'
import { TITLE_BAR } from '../../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../../constants/view'
import { View } from '../../types/misc'
import { sendIpc, throwIfPropertyUndefined } from '../../utils/misc'
import { IS_PRODUCTION } from '../../../constants/misc'
import { UserDialog } from '../../../types/dialog'
import { ON_DIALOG_OPEN } from '../../constants/communication'

export default class DialogView implements View {
  private static readonly DEFAULT_HTML_FILE = 'main-dialog.html'
  private view?: WebContentsView
  private userDialog: UserDialog

  constructor(contentSize: number[], userDialog: UserDialog) {
    this.userDialog = userDialog
    this.create(contentSize)
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    if (IS_PRODUCTION)
      this.view.webContents.loadFile(getAppPath(DialogView.DEFAULT_HTML_FILE))
    else
      this.view.webContents.loadURL(`${DEV_SERVER_BASE_URL}${DialogView.DEFAULT_HTML_FILE}`)
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
  }

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.setBounds({ x: 0, y: TITLE_BAR.HEIGHT, width: contentSize[0], height: contentSize[1] - TITLE_BAR.HEIGHT })
  }

  private create = (contentSize: number[]): void => {
    this.view = new WebContentsView({
      webPreferences: {
        preload: getAppPath('preload.js'),
        transparent: true,
      },
    })

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

  getWebView(): WebContentsView {
    throwIfPropertyUndefined('view', this.view)
    return this.view
  }
}
