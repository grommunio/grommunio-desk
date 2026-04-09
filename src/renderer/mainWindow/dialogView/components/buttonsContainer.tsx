// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './buttonsContainer.module.css'
import { UserDialogButton } from '../../../../types/dialog'

interface Props {
  buttons: UserDialogButton[]
  exitDialog: () => void
}

const ButtonsContainer = (props: Props): React.ReactElement => {
  const { t } = useTranslation()
  const buttons = useMemo(() => props.buttons.map((button, idx) => (
    <button
      className={`${styles.button} ${styles[`${button.type}Button`]}`}
      onClick={() => window.electronAPI.handleDialogButton(button)}
      onKeyDown={event => event.stopPropagation()} // when a button is focused and the Enter key is pressed, any other onKeyDown functionality should not be triggered
      key={`button-${idx}`}
    >
      {t(`mainWindow.dialogView.button.${button.type}`)}
    </button>
  )),
  [props.buttons])

  // only the first button with triggerOnEnter === true will be triggered
  const onEnterKeyDown = useCallback(() => {
    const button = props.buttons.find(button => button.triggerOnEnter === true)
    if (button != null)
      window.electronAPI.handleDialogButton(button)
  }, [props.buttons])

  const onKeyDown = useCallback((event: globalThis.KeyboardEvent): void => {
    if (event.key === 'Escape')
      props.exitDialog()
    else if (event.key === 'Enter')
      onEnterKeyDown()
  }, [onEnterKeyDown])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)

    return (): void => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  return (
    <>
      <div className={styles.container}>
        {buttons}
      </div>
    </>
  )
}

export default ButtonsContainer
