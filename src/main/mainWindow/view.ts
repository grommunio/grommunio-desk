// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView } from 'electron'

import { throwIfPropertyUndefined } from '../utils/misc'
import { DEV_TOOLS_OPTIONS } from '../constants/view'
import { TITLE_BAR } from '../../constants/window'

export default abstract class View {
  protected view?: WebContentsView

  adjustBounds = (contentSize: number[]): void => {
    throwIfPropertyUndefined('view', this.view)
    this.view.setBounds({ x: 0, y: TITLE_BAR.HEIGHT, width: contentSize[0], height: contentSize[1] - TITLE_BAR.HEIGHT })
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

  getWebView = (): WebContentsView => {
    throwIfPropertyUndefined('view', this.view)
    return this.view
  }
}
