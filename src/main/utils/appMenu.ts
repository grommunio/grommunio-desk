// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Server } from '../../types/misc'

interface AppMenuTemplateOptions {
  isMac: boolean
  servers: Server[]
  addServer: () => void
  switchServer: (server: Server) => void
  toggleMainViewDevTools: () => void
  toggleTitleBarDevTools: () => void
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
        label: `Server ${srv.id}`,
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
        click: options.toggleTitleBarDevTools,
        label: 'Toggle titleBarView developer tools',
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
