// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import { ServerURL } from '../types/misc'

import {
  CONFIG_SAVE_SERVER,
  TOGGLE_APP_MENU,
  VALIDATE_SERVER,
  ON_APP_MENU_CLOSE,
} from './constants/communication'

contextBridge.exposeInMainWorld('electronAPI', {
  saveServer: (server: ServerURL) => ipcRenderer.send(CONFIG_SAVE_SERVER, server),
  toggleAppMenu: () => ipcRenderer.send(TOGGLE_APP_MENU),

  validateServer: (server: string) => ipcRenderer.invoke(VALIDATE_SERVER, server),

  onAppMenuClose: (listener: () => void) => ipcRenderer.on(ON_APP_MENU_CLOSE, (_event: IpcRendererEvent) => listener()),
})
