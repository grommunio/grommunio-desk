// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { contextBridge, ipcRenderer } from 'electron'

import { ServerURL } from '../types/misc'

import {
  CONFIG_SAVE_SERVER,
} from './constants/communication'

contextBridge.exposeInMainWorld('electronAPI', {
  saveServer: (server: ServerURL) => ipcRenderer.send(CONFIG_SAVE_SERVER, server),
})
