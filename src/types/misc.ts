// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

export interface ServerOptions {
  url: string // TODO: use URL type instead of string -> handle possible errors thrown by URL constructor in StartPage (?)
  name: string
}
export interface Server extends ServerOptions {
  id: number
}
