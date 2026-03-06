// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './dialogBox.module.css'
import { UserDialog } from '../../../types/dialog'
import Logger from '../../utils/logger'

const logger = new Logger('renderer/mainWindow/dialogView/dialogBox')

const DialogBox = (): React.ReactElement => {
  const { t } = useTranslation()
  const [userDialog, setUserDialog] = useState<UserDialog | undefined>(undefined)
  const buttons = useMemo(() => userDialog
    ? userDialog.buttons.map((button, idx) => (
        <button className={styles.button} onClick={() => window.electronAPI.handleDialogButton(button)} key={`button-${idx}`}>
          {t(`mainWindow.dialogView.${button}Button`)}
        </button>
      ))
    : [],
  [userDialog])

  useEffect(() => {
    window.electronAPI.onDialogOpen(onDialogOpen)
  }, [])

  // IPC functions
  const onDialogOpen = (userDialog: UserDialog): void => {
    logger.silly('onDialogOpen', 'New dialog', userDialog)
    setUserDialog(userDialog)
  }

  return (
    <div className={styles.bg}>
      <div className={styles.dialogDiv}>
        <div className={styles.textDiv}>
          {
            userDialog
              ? t(`mainWindow.dialogView.${userDialog.text}Message`, userDialog.textArgs)
              : ''
          }
        </div>
        <div className={styles.separator} />
        <div className={styles.buttonDiv}>
          {buttons}
        </div>
      </div>
    </div>
  )
}

export default DialogBox
