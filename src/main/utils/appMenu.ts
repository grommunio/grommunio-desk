// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Server } from '../../types/misc'

interface AppMenuTemplateOptions {
  isMac: boolean
  servers: Server[]
  addServer: () => void
  switchServer: (server: Server) => void
  toggleMainViewDevTools: () => void
  toggleTitleBarViewTools: () => void
  toggleDialogViewDevTools: () => void
}

export const buildAppMenuTemplate = (options: AppMenuTemplateOptions): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] => [
  {
    label: 'File',
    submenu: [
      options.isMac ? { role: 'close' } : { role: 'quit' },
    ],
  },
  {
    label: 'Server',
    submenu: [
      ...options.servers.map(srv => ({
        click: () => options.switchServer(srv),
        label: `${srv.name}`,
      })),
      { type: 'separator' },
      {
        click: options.addServer,
        label: 'Add server',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        click: options.toggleMainViewDevTools,
        label: 'Toggle mainView developer tools',
      },
      {
        click: options.toggleTitleBarViewTools,
        label: 'Toggle titleBarView developer tools',
      },
      {
        click: options.toggleDialogViewDevTools,
        label: 'Toggle dialogView developer tools',
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      { role: 'about' },
    ],
  },
]
