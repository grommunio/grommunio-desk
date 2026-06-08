// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React from 'react'

import { UserInputDialog } from '../../../../types/dialog'
import ServerNameDialog from './serverNameDialog'

interface Props {
  userDialog: UserInputDialog
  exitDialog: () => void
}

const InputDialog = (props: Props): React.ReactElement => {
  return (
    <>
      {
        props.userDialog.title == 'input.serverName'
        && <ServerNameDialog userDialog={props.userDialog} exitDialog={props.exitDialog} />
      }
    </>
  )
}

export default InputDialog
