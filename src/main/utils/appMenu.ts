// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

interface AppMenuTemplateOptions {
  isMac: boolean
  onSwitchServer: () => void
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
        click: options.onSwitchServer,
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
