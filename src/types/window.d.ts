// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Server, ServerOptions } from './misc'

declare global {
  interface Window {
    electronAPI: {
      addServer: () => void
      saveServerAndReload: (server: ServerOptions) => void
      switchServer: (server: Server) => void
      toggleAppMenu: () => void

      validateServerUrl: (server: string) => Promise<boolean>

      onAppMenuClose: (listener: () => void) => void
      onServerSwitch: (listener: (server: Server | undefined) => void) => void
      onServerSave: (listener: (servers: Server[]) => void) => void
    }
  }
}
