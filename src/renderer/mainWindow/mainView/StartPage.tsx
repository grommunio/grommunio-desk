// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React, { ChangeEvent, useEffect, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './StartPage.module.css'
import Logger from '@utils/logger'
import logoImg from '../../../../assets/general/logo_with_text.png'
import backgroundImg from '../../../../assets/general/dark_background.jpg'

const logger = new Logger('renderer/mainWindow/mainView/StartPage')
const regexPattern = /^https:\/\/([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-z]+(?::[0-9]+)?(?:\/[^\s]*)?$/i
const serverValidationBeginTimeout = 400

const StartPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [isValidFormat, setValidFormat] = useState(true)
  const [serverValidationStatus, setServerValidationStatus] = useState<'notChecked' | 'checking' | 'valid' | 'invalid'>('notChecked')
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showSuccess = useMemo(() => isValidFormat && serverValidationStatus === 'valid', [isValidFormat, serverValidationStatus])
  const messageText = useMemo(() =>
    showSuccess
      ? t('mainWindow.mainView.validServer')
      : (!isValidFormat || serverValidationStatus === 'invalid')
          ? serverValidationStatus === 'invalid'
            ? t('mainWindow.mainView.invalidServer')
            : t('mainWindow.mainView.error')
          : '',
  [showSuccess, isValidFormat, serverValidationStatus])

  const onSend = async (): Promise<void> => {
    if (!isValidFormat || ['notChecked', 'checking'].includes(serverValidationStatus))
      return

    logger.debug('onSend', 'New server', input)
    window.electronAPI.saveServer(input)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value
    setInput(val)

    setServerValidationStatus('notChecked')
    if (!val) {
      setValidFormat(true)
      return
    }
    const isFormatValid = regexPattern.test(val)
    setValidFormat(isFormatValid)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && isValidFormat && serverValidationStatus == 'valid') {
      onSend()
    }
  }

  useEffect(() => {
    if (!input || !isValidFormat)
      return

    validationTimeoutRef.current = setTimeout(async () => {
      setServerValidationStatus('checking')
      const serverValid = await window.electronAPI.validateServer(input)
      if (validationTimeoutRef.current != runId)
        return
      if (serverValid)
        setServerValidationStatus('valid')
      else
        setServerValidationStatus('invalid')
    }, serverValidationBeginTimeout)
    const runId = validationTimeoutRef.current

    return (): void => {
      if (validationTimeoutRef.current != null) {
        clearTimeout(validationTimeoutRef.current)
        validationTimeoutRef.current = null
      }
    }
  }, [input, isValidFormat])

  return (
    <div className={styles.bg}>
      <img className={styles.bgImage} src={backgroundImg} />
      <div className={styles.content}>
        <img className={styles.logo} src={logoImg} alt="grommunio" />
        <p className={`${styles.description} ${input ? styles.descriptionHidden : ''}`}>
          {t('mainWindow.mainView.description')}
        </p>
        <input
          className={styles.input}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          type="url"
          autoCorrect="false"
          placeholder="https://mail.example.com"
          style={{
            borderColor: ['notChecked', 'checking'].includes(serverValidationStatus) ? 'transparent' : serverValidationStatus === 'valid' ? 'green' : 'red',
          }}
        />
        <div className={`${styles.validationFeedback}`}>
          {
            messageText
              ? (
                  <p className={`${styles.text} ${showSuccess ? styles.success : styles.error}`}>
                    {messageText}
                  </p>
                )
              : serverValidationStatus === 'checking'
                ? <div className={styles.loader} />
                : ''
          }
        </div>
        <button className={styles.button} onClick={onSend} disabled={!isValidFormat || ['notChecked', 'checking'].includes(serverValidationStatus)}>
          {t('mainWindow.mainView.submit')}
        </button>
      </div>
    </div>
  )
}

export default StartPage
