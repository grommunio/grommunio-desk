// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './serverNameDialog.module.css'
import { UserInputDialog, UserInputDialogButton } from '../../../../types/dialog'
import ButtonsContainer from '../components/buttonsContainer'
import InputField from '../../../components/inputField'
import { validateServerNameFormat } from '@utils/server'

interface Props {
  userDialog: UserInputDialog<'input.serverName'>
  exitDialog: () => void
}
enum NameValidationStatus {
  Unchecked = 'unchecked',
  InvalidFormat = 'invalid',
  Valid = 'valid',
}

const ServerNameDialog = (props: Props): React.ReactElement => {
  const { t } = useTranslation()
  const [name, setName] = useState(props.userDialog.inputParams.server.name)
  const nameValidationStatus = useMemo<NameValidationStatus>(() => {
    if (!name)
      return NameValidationStatus.Unchecked
    else if (!validateServerNameFormat(name))
      return NameValidationStatus.InvalidFormat
    else
      return NameValidationStatus.Valid
  }, [name])
  const feedbackText = useMemo(() => nameValidationStatus === NameValidationStatus.InvalidFormat
    ? t('mainWindow.dialogView.input.input.serverName.feedback.invalidFormat')
    : undefined,
  [nameValidationStatus, t])
  const buttons = useMemo(() => {
    return props.userDialog.buttons.map((button) => {
      if (button.type === 'input.editServerName') {
        return {
          ...button,
          disabled: nameValidationStatus !== NameValidationStatus.Valid,
        }
      }
      return button
    })
  }, [props.userDialog.buttons, nameValidationStatus])

  const sendDialogButton = (button: UserInputDialogButton<true>): void => {
    if (button.type === 'cancel')
      window.electronAPI.handleDialogButton(button)
    else if (button.type === 'input.editServerName') {
      window.electronAPI.handleDialogButton({
        ...button,
        input: { name },
      })
    }
  }

  return (
    <>
      <div className={styles.container}>
        <InputField
          value={name}
          type="text"
          placeholder={t('mainWindow.dialogView.input.input.serverName.placeholder')}
          feedback={feedbackText}
          validationStatus={nameValidationStatus}
          onChange={setName}
        />
      </div>
      <ButtonsContainer<UserInputDialogButton<true>>
        buttons={buttons}
        onButtonClick={sendDialogButton}
        onEnterKeyDown={sendDialogButton}
        exitDialog={props.exitDialog}
      />
    </>
  )
}

export default ServerNameDialog
