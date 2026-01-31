// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

interface AppMenuTemplateOptions {
  isMac: boolean
  resetServer: () => void
  onToggleMainViewDevTools: () => void
  onToggleTitleBarDevTools: () => void
}

export const buildAppMenuTemplate = (options: AppMenuTemplateOptions): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] => [
  {
    label: 'File',
    submenu: [
      // { type: 'separator' },
      options.isMac ? { role: 'close' } : { role: 'quit' },
    ],
  },
  {
    label: 'Server',
    submenu: [
      {
        click: options.resetServer,
        label: 'Switch server',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        click: options.onToggleMainViewDevTools,
        label: 'Toggle mainView developer tools',
      },
      {
        click: options.onToggleTitleBarDevTools,
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
