// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Session, session } from 'electron'

import { Server } from '../../types/misc'

export function getServerSessionPartition(server: Server): Session {
  return session.fromPartition(`persist:server-${server.id}`)
}
