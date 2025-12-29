// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { contextBridge, ipcRenderer } from 'electron'

import {
  CONFIG_SAVE_SERVER,
} from './constants/communication'

contextBridge.exposeInMainWorld('electronAPI', {
  saveServer: (server: string) => ipcRenderer.send(CONFIG_SAVE_SERVER, server),
})
