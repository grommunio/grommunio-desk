// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './selectDialog.module.css'
import { UserSelectDialog, UserSelectDialogButton } from '../../../types/dialog'
import ButtonsContainer from './components/buttonsContainer'
import SelectField from '../../components/selectField'
import { UserSelectDialogSelection } from '../../../types/dialog/selectDialog'

interface Props {
  userDialog: UserSelectDialog
  exitDialog: () => void
}

const SelectDialog = (props: Props): React.ReactElement => {
  const { t } = useTranslation()
  const [selectedValue, setSelectedValue] = useState<UserSelectDialogSelection | undefined>(undefined)
  const buttons = useMemo(
    () => [props.userDialog.buttons[0], { ...props.userDialog.buttons[1], disabled: selectedValue == null }],
    [props.userDialog, selectedValue],
  )

  const sendDialogButton = (button: UserSelectDialogButton<true>): void => {
    if (button.type === 'cancel')
      window.electronAPI.handleDialogButton(button)
    else if (selectedValue != null) {
      window.electronAPI.handleDialogButton({
        ...button,
        selection: selectedValue,
      } as Parameters<typeof window.electronAPI.handleDialogButton>[0])
    }
  }

  return (
    <>
      <p className={styles.text}>
        {t(`mainWindow.dialogView.text.${props.userDialog.text}`, props.userDialog.textArgs)}
      </p>
      <SelectField<UserSelectDialogSelection>
        className={styles.selectField}
        options={props.userDialog.optionValues}
        placeholderOption={props.userDialog.optionValues[0]}
        onChange={val => setSelectedValue(val)}
      />
      <ButtonsContainer<UserSelectDialogButton<true>>
        buttons={buttons}
        onButtonClick={sendDialogButton}
        onEnterKeyDown={sendDialogButton}
        exitDialog={props.exitDialog}
      />
    </>
  )
}

export default SelectDialog
