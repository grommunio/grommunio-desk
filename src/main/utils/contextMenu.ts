// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Menu, WebContents } from 'electron'

export const attachContextMenu = (webContents: WebContents): void => {
  webContents.on('context-menu', (_event, params) => {
    const menu = Menu.buildFromTemplate([
      { role: 'cut', enabled: params.editFlags.canCut },
      { role: 'copy', enabled: params.editFlags.canCopy },
      { role: 'paste', enabled: params.editFlags.canPaste },
      { type: 'separator' },
      { role: 'selectAll', enabled: params.editFlags.canSelectAll },
    ])
    menu.popup()
  })
}
