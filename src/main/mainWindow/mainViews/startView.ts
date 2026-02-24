// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView, shell, HandlerDetails, WindowOpenHandlerResponse } from 'electron'

import { getAppPath } from '../../utils/paths'
import { TITLE_BAR } from '../../../constants/window'
import { DEV_TOOLS_OPTIONS, DEV_SERVER_BASE_URL } from '../../constants/view'
import View from '../../interfaces/view'
import { throwIfPropertyUndefined } from '../../utils/misc'
import { IS_PRODUCTION } from '../../../constants/misc'

export default class StartView implements View {
  private static readonly DEFAULT_HTML_FILE = 'main-start.html'
  private view?: WebContentsView

  constructor(contentSize: number[]) {
    this.create(contentSize)
  }

  private load = (): void => {
    throwIfPropertyUndefined('view', this.view)

    if (IS_PRODUCTION)
      this.view.webContents.loadFile(getAppPath(StartView.DEFAULT_HTML_FILE))
    else
      this.view.webContents.loadURL(`${DEV_SERVER_BASE_URL}${StartView.DEFAULT_HTML_FILE}`)
  }

  private registerListeners = (): void => {
    throwIfPropertyUndefined('view', this.view)

    this.view.webContents.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    this.view.webContents.setWindowOpenHandler(({ url }: HandlerDetails): WindowOpenHandlerResponse => {
      shell.openExternal(url)
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
        preload: getAppPath('preload.js'),
      },
    })
    this.view.setBackgroundColor('#2a2b30')

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
