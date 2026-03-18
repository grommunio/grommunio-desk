// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
        <button
          className={`${styles.button} ${styles[`${button.name}Button`]}`}
          onClick={() => window.electronAPI.handleDialogButton(button)}
          onKeyDown={event => event.stopPropagation()} // when a button is focused and the Enter key is pressed, any other onKeyDown functionality should not be triggered
          key={`button-${idx}`}
        >
          {t(`mainWindow.dialogView.${button.name}Button`)}
        </button>
      ))
    : [],
  [userDialog])

  useEffect(() => {
    window.electronAPI.onDialogOpen(onDialogOpen)
  }, [])

  // only the first button with triggerOnEscape / triggerOnEnter === true will be triggered
  const onEscapeKeyDown = useCallback(() => {
    const button = userDialog?.buttons.find(button => button.triggerOnEscape === true)
    if (button != null)
      window.electronAPI.handleDialogButton(button)
  }, [userDialog])

  const onEnterKeyDown = useCallback(() => {
    const button = userDialog?.buttons.find(button => button.triggerOnEnter === true)
    if (button != null)
      window.electronAPI.handleDialogButton(button)
  }, [userDialog])

  const onKeyDown = useCallback((event: globalThis.KeyboardEvent): void => {
    if (event.key === 'Escape')
      onEscapeKeyDown()
    else if (event.key === 'Enter')
      onEnterKeyDown()
  }, [onEscapeKeyDown, onEnterKeyDown])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)

    return (): void => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  const onBackdropClick = useCallback((): void => {
    onEscapeKeyDown()
  }, [onEscapeKeyDown])

  // IPC functions
  const onDialogOpen = (userDialog: UserDialog): void => {
    logger.silly('onDialogOpen', 'New dialog', userDialog)
    setUserDialog(userDialog)
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={onBackdropClick}
    >
      {
        userDialog
          ? (
              <div
                className={styles.dialogDiv}
                onMouseDown={event => event.stopPropagation()}
              >
                <h3 className={styles.title}>
                  {t(`mainWindow.dialogView.${userDialog.text}Title`, userDialog.textArgs)}
                </h3>
                <p className={styles.text}>
                  {t(`mainWindow.dialogView.${userDialog.text}Text`, userDialog.textArgs)}
                </p>
                <div className={styles.buttonDiv}>
                  {buttons}
                </div>
              </div>
            )
          : ''
      }
    </div>
  )
}

export default DialogBox
