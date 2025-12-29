// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

export {}

declare global {
  interface Window {
    electronAPI: {
      saveServer: (server: string) => void
    }
  }
}
