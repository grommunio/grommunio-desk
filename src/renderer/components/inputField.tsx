// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React from 'react'
import { InputHTMLAttributes } from 'react'

import styles from './inputField.module.css'
import componentStyles from './component.module.css'

export type ValidationStatus = 'valid' | 'warn' | 'invalid' | 'checking' | 'unchecked'
interface Props {
  value: string
  type: InputHTMLAttributes<HTMLInputElement>['type']
  className?: string
  placeholder: string
  feedback?: string
  validationStatus: ValidationStatus
  ref?: React.Ref<HTMLInputElement>
  disableSpellCheck?: boolean
  onChange: (value: string) => void
  onEnterKeyDown?: () => void
}

const INPUT_FIELD_COLOR: Record<ValidationStatus, string | undefined> = {
  valid: 'green',
  warn: 'orange',
  invalid: 'red',
  checking: undefined,
  unchecked: undefined,
}
const FEEDBACK_TEXT_COLOR: Record<ValidationStatus, string | undefined> = {
  valid: 'rgba(120, 220, 160, 0.95)',
  warn: 'rgba(255, 168, 1, 0.9)',
  invalid: 'rgba(255, 120, 120, 0.9)',
  checking: undefined,
  unchecked: undefined,
}

const InputField = (props: Props): React.ReactElement => {
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    props.onChange(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      props.onEnterKeyDown?.()
    }
  }

  return (
    <div className={`${styles.container} ${props.className != null ? props.className : ''}`}>
      <input
        className={` ${componentStyles.component} ${styles.input} ${INPUT_FIELD_COLOR[props.validationStatus] != null ? styles.borderFeedback : ''}`}
        ref={props.ref}
        value={props.value}
        onChange={handleValueChange}
        onKeyDown={handleKeyDown}
        type={props.type}
        autoCorrect="false"
        placeholder={props.placeholder}
        spellCheck={!props.disableSpellCheck}
        style={{
          borderColor: INPUT_FIELD_COLOR[props.validationStatus],
        }}
      />
      <div className={styles.feedback}>
        {
          props.feedback
          && (
            <p
              className={styles.text}
              style={{
                color: FEEDBACK_TEXT_COLOR[props.validationStatus],
              }}
            >
              {props.feedback}
            </p>
          )
        }
        {
          props.validationStatus === 'checking'
          && (
            <div className={styles.loader} />
          )
        }
      </div>
    </div>
  )
}

export default InputField
