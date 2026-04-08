// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { SystemPlatform, Server, ServerOptions, ServerSystem } from './misc'
import { UserConfirmDialogButton, UserDialog } from './dialog'

declare global {
  interface Window {
    electronAPI: {
      // ipcRenderer.send one-way
      addServer: () => void
      loadNewServer: (server: ServerOptions) => void
      switchServer: (server: Server) => void
      toggleAppMenu: () => void
      handleDialogButton: (button: UserConfirmDialogButton) => void
      setTitleBarServerMenuOpen: (isOpen: boolean) => void
      openDialog: (userDialog: UserDialog) => void
      exitDialog: () => void

      // ipcRenderer.sendSync two-way (synchronous)
      getSystemPlatform: () => SystemPlatform

      // ipcRenderer.invoke two-way (asynchronous)
      validateServerUrl: (server: string) => Promise<ServerSystem | null>

      // ipcRenderer.on one-way
      onAppMenuClose: (listener: () => void) => void
      onServerSwitch: (listener: (server: Server | undefined) => void) => void
      onServerSave: (listener: (servers: Server[]) => void) => void
      onDialogOpen: (listener: (userDialog: UserDialog) => void) => void
      onDialogChange: (listener: (isDialogOpen: boolean) => void) => void
    }
  }
}
