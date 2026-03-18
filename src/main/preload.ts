// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

import { ServerOptions, Server } from '../types/misc'
import { UserDialogButton, UserDialog } from '../types/dialog'

import {
  ADD_SERVER,
  LOAD_NEW_SERVER,
  SWITCH_SERVER,
  TOGGLE_APP_MENU,
  VALIDATE_SERVER_URL,
  ON_APP_MENU_CLOSE,
  ON_SERVER_SWITCH,
  ON_SERVER_SAVE,
  ON_DIALOG_OPEN,
  HANDLE_DIALOG_BUTTON,
  SET_TITLE_BAR_SERVER_MENU_OPEN,
  OPEN_DIALOG,
  ON_DIALOG_CHANGE,
} from './constants/communication'

// TODO: check if it is possible to make the ipc functions type proof -> type checking when calling e.g. ipcMain.on(...)
contextBridge.exposeInMainWorld('electronAPI', {
  addServer: () => ipcRenderer.send(ADD_SERVER),
  loadNewServer: (server: ServerOptions) => ipcRenderer.send(LOAD_NEW_SERVER, server),
  switchServer: (server: Server) => ipcRenderer.send(SWITCH_SERVER, server),
  toggleAppMenu: () => ipcRenderer.send(TOGGLE_APP_MENU),
  handleDialogButton: (button: UserDialogButton) => ipcRenderer.send(HANDLE_DIALOG_BUTTON, button),
  setTitleBarServerMenuOpen: (isOpen: boolean) => ipcRenderer.send(SET_TITLE_BAR_SERVER_MENU_OPEN, isOpen),
  openDialog: (userDialog: UserDialog) => ipcRenderer.send(OPEN_DIALOG, userDialog),

  validateServerUrl: (server: string) => ipcRenderer.invoke(VALIDATE_SERVER_URL, server),

  onAppMenuClose: (listener: () => void) => ipcRenderer.on(ON_APP_MENU_CLOSE, (_event: IpcRendererEvent) => listener()), // TODO: remove extra anonymous arrow function (listener must handle event parameter) (?)
  onServerSwitch: (listener: (server: Server | undefined) => void) => ipcRenderer.on(ON_SERVER_SWITCH, (_event: IpcRendererEvent, server: Server | undefined) => listener(server)),
  onServerSave: (listener: (servers: Server[]) => void) => ipcRenderer.on(ON_SERVER_SAVE, (_event: IpcRendererEvent, servers: Server[]) => listener(servers)),
  onDialogOpen: (listener: (userDialog: UserDialog) => void) => ipcRenderer.on(ON_DIALOG_OPEN, (_event: IpcRendererEvent, userDialog: UserDialog) => listener(userDialog)),
  onDialogChange: (listener: (isDialogOpen: boolean) => void) => ipcRenderer.on(ON_DIALOG_CHANGE, (_event: IpcRendererEvent, isDialogOpen: boolean) => listener(isDialogOpen)),
})
