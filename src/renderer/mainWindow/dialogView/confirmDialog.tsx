// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './confirmDialog.module.css'
import { UserConfirmDialog, UserConfirmDialogButton } from '../../../types/dialog'
import ButtonsContainer from './components/buttonsContainer'

interface Props {
  userDialog: UserConfirmDialog
  exitDialog: () => void
}

const ConfirmDialog = (props: Props): React.ReactElement => {
  const { t } = useTranslation()

  const sendDialogButton = (button: UserConfirmDialogButton): void => {
    window.electronAPI.handleDialogButton(button)
  }

  return (
    <>
      <p className={styles.text}>
        {t(`mainWindow.dialogView.text.${props.userDialog.text}`, props.userDialog.textArgs)}
      </p>
      <ButtonsContainer<UserConfirmDialogButton>
        buttons={props.userDialog.buttons}
        onButtonClick={sendDialogButton}
        onEnterKeyDown={sendDialogButton}
        exitDialog={props.exitDialog}
      />
    </>
  )
}

export default ConfirmDialog
