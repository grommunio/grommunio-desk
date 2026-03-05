// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import { ServerOptions, Server } from '../types/misc'
import { UserNotificationButton, UserNotification } from '../types/userNotification'

import {
  ADD_SERVER,
  LOAD_NEW_SERVER,
  SWITCH_SERVER,
  TOGGLE_APP_MENU,
  VALIDATE_SERVER_URL,
  ON_APP_MENU_CLOSE,
  ON_SERVER_SWITCH,
  ON_SERVER_SAVE,
  ON_NOTIFICATION,
  HANDLE_NOTIFICATION_BUTTON,
  SET_TITLE_BAR_SERVER_MENU_OPEN,
} from './constants/communication'

// TODO: check if it is possible to make the ipc functions type proof -> type checking when calling e.g. ipcMain.on(...)
contextBridge.exposeInMainWorld('electronAPI', {
  addServer: () => ipcRenderer.send(ADD_SERVER),
  loadNewServer: (server: ServerOptions) => ipcRenderer.send(LOAD_NEW_SERVER, server),
  switchServer: (server: Server) => ipcRenderer.send(SWITCH_SERVER, server),
  toggleAppMenu: () => ipcRenderer.send(TOGGLE_APP_MENU),
  handleNotificationButton: (button: UserNotificationButton) => ipcRenderer.send(HANDLE_NOTIFICATION_BUTTON, button),
  setTitleBarServerMenuOpen: (isOpen: boolean) => ipcRenderer.send(SET_TITLE_BAR_SERVER_MENU_OPEN, isOpen),

  validateServerUrl: (server: string) => ipcRenderer.invoke(VALIDATE_SERVER_URL, server),

  onAppMenuClose: (listener: () => void) => ipcRenderer.on(ON_APP_MENU_CLOSE, (_event: IpcRendererEvent) => listener()),
  onServerSwitch: (listener: (server: Server | undefined) => void) => ipcRenderer.on(ON_SERVER_SWITCH, (_event: IpcRendererEvent, server: Server | undefined) => listener(server)),
  onServerSave: (listener: (servers: Server[]) => void) => ipcRenderer.on(ON_SERVER_SAVE, (_event: IpcRendererEvent, servers: Server[]) => listener(servers)),
  onNotification: (listener: (notification: UserNotification) => void) => ipcRenderer.on(ON_NOTIFICATION, (_event: IpcRendererEvent, notification: UserNotification) => listener(notification)),
})
