// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './dialog.module.css'
import { UserDialog } from '../../../types/dialog'
import Logger from '../../utils/logger'
import ConfirmDialog from './confirmDialog'
import SelectDialog from './selectDialog'
import InputDialog from './inputDialog'

const logger = new Logger('renderer/mainWindow/dialogView/dialog')

const Dialog = (): React.ReactElement => {
  const { t } = useTranslation()
  const [userDialog, setUserDialog] = useState<UserDialog | undefined>(undefined)

  useEffect(() => {
    window.electronAPI.onDialogOpen(onDialogOpen)
  }, [])

  const exitDialog = (): void => {
    if (userDialog?.exitAllowed === true)
      window.electronAPI.exitDialog()
  }

  // IPC functions
  const onDialogOpen = (userDialog: UserDialog): void => {
    logger.silly('onDialogOpen', `New dialog of type '${userDialog.type}'`, userDialog)
    setUserDialog(userDialog)
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={exitDialog}
    >
      {
        userDialog && (
          <div
            className={styles.dialogDiv}
            onMouseDown={event => event.stopPropagation()}
          >
            <h3 className={styles.title}>
              {t(`mainWindow.dialogView.title.${userDialog.title}`)}
            </h3>
            {
              userDialog?.type === 'confirm'
              && <ConfirmDialog userDialog={userDialog} exitDialog={exitDialog} />
            }
            {
              userDialog?.type === 'select'
              && <SelectDialog userDialog={userDialog} exitDialog={exitDialog} />
            }
            {
              userDialog?.type === 'input'
              && <InputDialog userDialog={userDialog} exitDialog={exitDialog} />
            }
          </div>
        )
      }
    </div>
  )
}

export default Dialog
