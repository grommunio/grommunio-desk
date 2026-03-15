// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { WebContentsView } from 'electron'

export function throwIfPropertyUndefined<T>(name: string, x: T | undefined): asserts x is T {
  if (x == null) throw new Error(`Property '${name}' is unexpectedly null`)
}

export function sendIpc(view: WebContentsView | undefined, channel: string, ...args: unknown[]): void {
  // TODO: report this Electron bug
  // There is an Electron bug that temporarily disables an IPC channel if a message is sent
  // before the view is fully loaded. To avoid this, an extra check is necessary.
  if (view != null && !view.webContents.isWaitingForResponse()) // TODO: throw error if view == null (?)
    view?.webContents.send(channel, ...args)
}
