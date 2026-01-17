// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { ServerURL } from './misc'

declare global {
  interface Window {
    electronAPI: {
      saveServer: (server: ServerURL) => void
      toggleAppMenu: () => void

      validateServer: (server: string) => Promise<boolean>

      onAppMenuClose: (listener: () => void) => void
    }
  }
}
