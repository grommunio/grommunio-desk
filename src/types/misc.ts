// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

export interface ServerOptions {
  url: string
  name: string
}
export interface Server extends ServerOptions {
  id: number
}
