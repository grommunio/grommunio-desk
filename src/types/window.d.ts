// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import { ServerURL } from './misc'

declare global {
  interface Window {
    electronAPI: {
      saveServer: (server: ServerURL) => void
      toggleAppMenu: () => void

      onAppMenuClose: (listener: () => void) => void
    }
  }
}
