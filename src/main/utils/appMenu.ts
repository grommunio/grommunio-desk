// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

export const buildAppMenuTemplate = (isMac: boolean, onSwitchServer: () => void): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] => [
  {
    label: 'File',
    submenu: [
      // { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  },
  {
    label: 'Server',
    submenu: [
      {
        click: onSwitchServer,
        label: 'Switch server',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'toggleDevTools' },
    ],
  },
  {
    label: 'Help',
    submenu: [
      { role: 'about' },
    ],
  },
]
