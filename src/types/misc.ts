// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

export type ServerType = 'web' | 'chat'
export type ServerVersion = string
export interface ServerSystem {
  type: ServerType
  version: ServerVersion
}
export interface ServerOptions {
  url: string // TODO: use URL type instead of string -> handle possible errors thrown by URL constructor in StartPage (?)
  name: string
  system: ServerSystem | null
}
export interface Server extends ServerOptions {
  id: number
}

export type SystemPlatform = 'linux' | 'mac' | 'win'
