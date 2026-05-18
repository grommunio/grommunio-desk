// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React from 'react'

import { ServerSystem } from '../../../types/misc'
import ChatServerIcon from './icons/chatServerIcon'
import MailServerIcon from './icons/mailServerIcon'
import ServerIcon from './icons/serverIcon'

interface Props {
  system: ServerSystem | null
}

const ServerTypeIcon = (props: Props): React.ReactElement => {
  switch (props.system?.type) {
    case 'web':
      return <MailServerIcon />
    case 'chat':
      return <ChatServerIcon />
    default:
      return <ServerIcon />
  }
}

export default ServerTypeIcon
