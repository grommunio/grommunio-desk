// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Server, ServerOptions } from './misc'
import { UserNotificationButton, UserNotification } from './userNotification'

declare global {
  interface Window {
    electronAPI: {
      addServer: () => void
      loadNewServer: (server: ServerOptions) => void
      switchServer: (server: Server) => void
      toggleAppMenu: () => void
      handleNotificationButton: (button: UserNotificationButton) => void
      setTitleBarServerMenuOpen: (isOpen: boolean) => void

      validateServerUrl: (server: string) => Promise<boolean>

      onAppMenuClose: (listener: () => void) => void
      onServerSwitch: (listener: (server: Server | undefined) => void) => void
      onServerSave: (listener: (servers: Server[]) => void) => void
      onNotification: (listener: (notification: UserNotification) => void) => void
    }
  }
}
