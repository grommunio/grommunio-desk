// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Server, ServerOptions } from './misc'
import { UserDialogButton, UserDialog } from './dialog'

declare global {
  interface Window {
    electronAPI: {
      addServer: () => void
      loadNewServer: (server: ServerOptions) => void
      switchServer: (server: Server) => void
      toggleAppMenu: () => void
      handleDialogButton: (button: UserDialogButton) => void
      setTitleBarServerMenuOpen: (isOpen: boolean) => void
      openDialog: (userDialog: UserDialog) => void

      validateServerUrl: (server: string) => Promise<boolean>

      onAppMenuClose: (listener: () => void) => void
      onServerSwitch: (listener: (server: Server | undefined) => void) => void
      onServerSave: (listener: (servers: Server[]) => void) => void
      onDialogOpen: (listener: (userDialog: UserDialog) => void) => void
    }
  }
}
