// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { View as ElectronView } from 'electron'
export default interface View {
  adjustBounds(contentSize: number[]): void
  close(): void
  toggleDevTools(): void
  getWebView(): ElectronView | undefined
}
