// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { ChangeEvent, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './StartPage.module.css'
import Logger from '@utils/logger'
import { ServerOptions } from '../../../types/misc'
import logoImg from '../../../../assets/general/logo_with_text.png'
import backgroundImg from '../../../../assets/general/dark_background.jpg'

const logger = new Logger('renderer/mainWindow/startView/StartPage')
const URL_REGEX_PATTERN = /^https:\/\/([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]+(?::[0-9]+)?(?:\/[^\s]*)?$/i
const URL_VALIDATION_BEGIN_TIMEOUT = 400
const NAME_REGEX_PATTERN = /^[a-z0-9-_ ]*$/i
const NAME_MAX_LENGTH = 20
const INPUT_FIELD_VALID_COLOR = 'green'
const INPUT_FIELD_INVALID_COLOR = 'red'
const INPUT_FIELD_WARN_COLOR = 'orange'
const FEEDBACK_TEXT_VALID_COLOR = 'rgba(120, 220, 160, 0.95)'
const FEEDBACK_TEXT_INVALID_COLOR = 'rgba(255, 120, 120, 0.9)'
const FEEDBACK_TEXT_WARN_COLOR = 'rgb(255, 168, 1.0)'

const StartPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [urlInput, setUrlInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [urlValidationStatus, setUrlValidationStatus] = useState<'notChecked' | 'invalidFormat' | 'checking' | 'invalidServer' | 'valid'>('notChecked')
  const [nameValidationStatus, setNameValidationStatus] = useState<'notChecked' | 'invalidFormat' | 'valid'>('notChecked')
  const urlValidationTimeoutRef = useRef<NodeJS.Timeout>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const isReadyToSubmit = useMemo(() => ['invalidServer', 'valid'].includes(urlValidationStatus) && nameValidationStatus === 'valid', [urlValidationStatus, nameValidationStatus])
  const urlValidationFeedbackText = useMemo(() =>
    urlValidationStatus === 'valid'
      ? t('mainWindow.startView.urlValid')
      : urlValidationStatus === 'invalidFormat'
        ? t('mainWindow.startView.urlInvalidFormat')
        : urlValidationStatus === 'invalidServer'
          ? t('mainWindow.startView.urlInvalidServer')
          : '',
  [urlValidationStatus])

  const onSend = async (): Promise<void> => {
    if (!isReadyToSubmit)
      return

    const server: ServerOptions = { url: urlInput, name: nameInput }
    logger.debug('onSend', 'New server:', server)
    window.electronAPI.saveServerAndReload(server)
  }

  const handleChange = (field: 'name' | 'url') => (e: ChangeEvent<HTMLInputElement>): void => {
    const inputVal = e.target.value

    if (field === 'name') {
      setNameInput(inputVal)
      if (!inputVal) {
        setNameValidationStatus('notChecked')
      }
      else if (!NAME_REGEX_PATTERN.test(inputVal) || inputVal.length > NAME_MAX_LENGTH) {
        setNameValidationStatus('invalidFormat')
      }
      else {
        setNameValidationStatus('valid')
      }
    }
    else {
      setUrlInput(inputVal)
      setUrlValidationStatus('notChecked')
      if (urlValidationTimeoutRef.current) {
        clearTimeout(urlValidationTimeoutRef.current)
        urlValidationTimeoutRef.current = null
      }
      if (!inputVal) {
        return
      }
      if (!URL_REGEX_PATTERN.test(inputVal)) {
        setUrlValidationStatus('invalidFormat')
        return
      }
      urlValidationTimeoutRef.current = setTimeout(async () => {
        setUrlValidationStatus('checking')
        // logger.silly('handleChange.timeoutFunc', 'Validating url', inputVal, runId)
        const serverValid = await window.electronAPI.validateServerUrl(inputVal)
        // logger.silly('handleChange.timeoutFunc', 'Validation completed', inputVal, serverValid, urlValidationTimeoutRef.current, runId)
        if (urlValidationTimeoutRef.current != runId)
          return
        if (serverValid)
          setUrlValidationStatus('valid')
        else
          setUrlValidationStatus('invalidServer')
      }, URL_VALIDATION_BEGIN_TIMEOUT)
      const runId = urlValidationTimeoutRef.current
    }
  }

  const handleKeyDown = (field: 'name' | 'url') => (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      if (field === 'name') {
        urlInputRef.current?.focus()
      }
      else {
        onSend()
      }
    }
  }

  // TODO: remove description and show information / feedback (for name field) text in a tooltip when hovering over input fields
  // TODO: improve name feedback: inform user about max-length and regex-check
  return (
    <div className={styles.bg}>
      <img className={styles.bgImage} src={backgroundImg} />
      <div className={styles.content}>
        <img className={styles.logo} src={logoImg} alt="grommunio" />
        <p className={`${styles.description} ${(urlInput || nameInput) ? styles.descriptionHidden : ''}`}>
          {t('mainWindow.startView.description')}
        </p>
        <input
          className={styles.input}
          value={nameInput}
          onChange={handleChange('name')}
          onKeyDown={handleKeyDown('name')}
          type="text"
          autoCorrect="false"
          placeholder="Your server name"
          style={{
            borderColor: nameValidationStatus === 'notChecked'
              ? 'transparent'
              : nameValidationStatus === 'valid'
                ? INPUT_FIELD_VALID_COLOR
                : INPUT_FIELD_INVALID_COLOR,
          }}
        />
        <div className={`${styles.validationFeedback}`}>
          {
            nameValidationStatus === 'invalidFormat'
              ? (
                  <p className={styles.text} style={{ color: FEEDBACK_TEXT_INVALID_COLOR }}>
                    {t('mainWindow.startView.nameInvalidFormat')}
                  </p>
                )
              : ''
          }
        </div>
        <input
          className={styles.input}
          ref={urlInputRef}
          value={urlInput}
          onChange={handleChange('url')}
          onKeyDown={handleKeyDown('url')}
          type="url"
          autoCorrect="false"
          placeholder="https://mail.example.com"
          style={{
            borderColor: ['notChecked', 'checking'].includes(urlValidationStatus)
              ? 'transparent'
              : urlValidationStatus === 'valid'
                ? INPUT_FIELD_VALID_COLOR
                : urlValidationStatus === 'invalidServer'
                  ? INPUT_FIELD_WARN_COLOR
                  : INPUT_FIELD_INVALID_COLOR,
          }}
        />
        <div className={`${styles.validationFeedback}`}>
          {
            urlValidationFeedbackText
              ? (
                  <p
                    className={styles.text}
                    style={{
                      color: urlValidationStatus === 'valid'
                        ? FEEDBACK_TEXT_VALID_COLOR
                        : urlValidationStatus === 'invalidServer'
                          ? FEEDBACK_TEXT_WARN_COLOR
                          : FEEDBACK_TEXT_INVALID_COLOR,
                    }}
                  >
                    {urlValidationFeedbackText}
                  </p>
                )
              : urlValidationStatus === 'checking'
                ? <div className={styles.loader} />
                : ''
          }
        </div>
        <button className={styles.button} onClick={onSend} disabled={!isReadyToSubmit}>
          {t('mainWindow.startView.submit')}
        </button>
      </div>
    </div>
  )
}

export default StartPage
