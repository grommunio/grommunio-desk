// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { ChangeEvent, useEffect, useRef, useState, useMemo } from 'react'
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
    const val = e.target.value

    if (field === 'name') {
      setNameInput(val)
      if (!val) {
        setNameValidationStatus('notChecked')
      }
      else if (!NAME_REGEX_PATTERN.test(val) || val.length > NAME_MAX_LENGTH) {
        setNameValidationStatus('invalidFormat')
      }
      else {
        setNameValidationStatus('valid')
      }
    }
    else {
      setUrlInput(val)
      setUrlValidationStatus('notChecked')
      if (!val) {
        setUrlValidationStatus('notChecked')
        return
      }
      if (!URL_REGEX_PATTERN.test(val)) {
        setUrlValidationStatus('invalidFormat')
        return
      }
      setUrlValidationStatus('notChecked')
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

  useEffect(() => {
    if (!urlInput || urlValidationStatus !== 'notChecked')
      return
    if (urlValidationTimeoutRef.current)
      clearTimeout(urlValidationTimeoutRef.current)
    urlValidationTimeoutRef.current = setTimeout(async () => {
      setUrlValidationStatus('checking')
      // logger.silly('handleChange.timeoutFunc', 'Validating url', urlInput, runId)
      const serverValid = await window.electronAPI.validateServerUrl(urlInput)
      // logger.silly('handleChange.timeoutFunc', 'Validation completed', urlInput, serverValid, urlValidationTimeoutRef.current, runId)
      if (urlValidationTimeoutRef.current != runId)
        return
      if (serverValid)
        setUrlValidationStatus('valid')
      else
        setUrlValidationStatus('invalidServer')
    }, URL_VALIDATION_BEGIN_TIMEOUT)
    const runId = urlValidationTimeoutRef.current
  }, [urlInput, urlValidationStatus])

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
            borderColor: nameValidationStatus === 'notChecked' ? 'transparent' : nameValidationStatus === 'valid' ? 'green' : 'red',
          }}
        />
        <div className={`${styles.validationFeedback}`}>
          {
            nameValidationStatus === 'invalidFormat'
              ? (
                  <p className={`${styles.text} ${styles.error}`}>
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
            borderColor: ['notChecked', 'checking'].includes(urlValidationStatus) ? 'transparent' : urlValidationStatus === 'valid' ? 'green' : 'red',
          }}
        />
        <div className={`${styles.validationFeedback}`}>
          {
            urlValidationFeedbackText
              ? (
                  <p className={`${styles.text} ${urlValidationStatus === 'valid' ? styles.success : styles.error}`}>
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
