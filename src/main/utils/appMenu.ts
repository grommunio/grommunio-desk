// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Server } from '../../types/misc'

interface AppMenuTemplateOptions {
  isMac: boolean
  servers: Server[]
  reloadServerViewEnabled: boolean
  addServer: () => void
  switchServer: (server: Server) => void
  toggleMainViewDevTools: () => void
  toggleTitleBarViewTools: () => void
  toggleDialogViewDevTools: () => void
  reloadServerView: () => void
  hardReloadServerView: () => void
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
}

export const buildAppMenuTemplate = (options: AppMenuTemplateOptions): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] => [
  ...(options.isMac ? [{ role: 'appMenu' }] as const : []),
  {
    label: 'File',
    submenu: [
      ...(options.isMac ? [{ role: 'close' }] as const : [{ role: 'quit' }] as const),
    ],
  },
  ...(options.isMac ? [{ role: 'editMenu' }] as const : []),
  {
    label: 'Server',
    submenu: [
      ...options.servers.map(srv => ({
        click: () => options.switchServer(srv),
        label: `${srv.name}`,
      })),
      { type: 'separator' },
      {
        label: 'Add server',
        click: options.addServer,
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload server',
        click: options.reloadServerView,
        accelerator: 'CmdOrCtrl+R', // TODO: disable accelerator registration and use own key listener
        enabled: options.reloadServerViewEnabled,
      },
      {
        label: 'Reload server (ignoring cache)',
        click: options.hardReloadServerView,
        accelerator: 'CmdOrCtrl+Shift+R',
        enabled: options.reloadServerViewEnabled,
      },
      { type: 'separator' },
      {
        label: 'Actual Size', // TODO: disable buttons when active View is not a ServerView
        click: options.zoomReset,
        accelerator: 'CmdOrCtrl+0',
        registerAccelerator: false,
      },
      {
        label: 'Zoom In',
        click: options.zoomIn,
        accelerator: 'CmdOrCtrl+Plus',
        registerAccelerator: false,
      },
      {
        label: 'Zoom Out',
        click: options.zoomOut,
        accelerator: 'CmdOrCtrl+-',
        registerAccelerator: false,
      },
      { type: 'separator' },
      {
        label: 'Toggle mainView developer tools',
        click: options.toggleMainViewDevTools,
      },
      {
        label: 'Toggle titleBarView developer tools',
        click: options.toggleTitleBarViewTools,
      },
      {
        label: 'Toggle dialogView developer tools',
        click: options.toggleDialogViewDevTools,
      },
    ],
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' },
    ],
  },
  {
    label: 'Help',
    submenu: [
      { role: 'about' },
    ],
  },
]
