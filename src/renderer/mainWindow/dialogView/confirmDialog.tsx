// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './confirmDialog.module.css'
import { UserConfirmDialog } from '../../../types/dialog'
import ButtonsContainer from './components/buttonsContainer'

interface Props {
  userDialog: UserConfirmDialog
  exitDialog: () => void
}

const ConfirmDialog = (props: Props): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <>
      <p className={styles.text}>
        {t(`mainWindow.dialogView.text.${props.userDialog.text}`, props.userDialog.textArgs)}
      </p>
      <ButtonsContainer buttons={props.userDialog.buttons} exitDialog={props.exitDialog} />
    </>
  )
}

export default ConfirmDialog
