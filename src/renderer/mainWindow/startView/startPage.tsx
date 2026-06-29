// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './startPage.module.css'
import Logger from '@utils/logger'
import { validateServerNameFormat, validateServerUrlFormat } from '@utils/server'
import { ServerOptions, ServerSystem, ServerUrl } from '../../../types/misc'
import InputField from '../../components/inputField'

enum UrlValidationStatus {
  Unchecked = 'unchecked',
  InvalidFormat = 'invalid',
  Checking = 'checking',
  InvalidServer = 'warn',
  Valid = 'valid',
}
enum NameValidationStatus {
  Unchecked = 'unchecked',
  InvalidFormat = 'invalid',
  Valid = 'valid',
}

const logger = new Logger('renderer/mainWindow/startView/startPage')
const URL_VALIDATION_BEGIN_TIMEOUT = 400

const StartPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [urlInput, setUrlInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [urlValidationStatus, setUrlValidationStatus] = useState<UrlValidationStatus>(UrlValidationStatus.Unchecked)
  const [nameValidationStatus, setNameValidationStatus] = useState<NameValidationStatus>(NameValidationStatus.Unchecked)
  // TODO: show user in InputField, which server url (urlServer[1]) the system will adopt (difference between user input and 'real' url), if he confirms
  const [urlServerValidation, setUrlServerValidation] = useState<{ system: ServerSystem, url: ServerUrl } | null>(null)
  const urlValidationTimeoutRef = useRef<NodeJS.Timeout>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const isReadyToSubmit = useMemo(() =>
    [UrlValidationStatus.InvalidServer, UrlValidationStatus.Valid].includes(urlValidationStatus) && nameValidationStatus === NameValidationStatus.Valid,
  [urlValidationStatus, nameValidationStatus])
  const urlValidationFeedbackText = useMemo(() =>
    urlValidationStatus === UrlValidationStatus.Valid
      ? `${t(`mainWindow.startView.input.url.feedback.valid.${urlServerValidation?.system.type}`)}: ${t(`mainWindow.startView.input.url.feedback.valid.version`, { system: urlServerValidation?.system })}`
      : urlValidationStatus === UrlValidationStatus.InvalidFormat
        ? t('mainWindow.startView.input.url.feedback.invalidFormat')
        : urlValidationStatus === UrlValidationStatus.InvalidServer
          ? t('mainWindow.startView.input.url.feedback.invalidServer')
          : undefined,
  [urlValidationStatus, urlServerValidation])

  const onSend = async (): Promise<void> => {
    if (!isReadyToSubmit)
      return

    const server: ServerOptions = {
      url: urlServerValidation?.url || urlInput,
      name: nameInput,
      system: urlServerValidation?.system || null,
    }
    logger.debug('onSend', 'New server:', server)
    window.electronAPI.loadNewServer(server)
  }

  const handleChange = (field: 'name' | 'url') => (value: string): void => {
    if (field === 'name') {
      setNameInput(value)
      if (!value) {
        setNameValidationStatus(NameValidationStatus.Unchecked)
      }
      else if (!validateServerNameFormat(value)) {
        setNameValidationStatus(NameValidationStatus.InvalidFormat)
      }
      else {
        setNameValidationStatus(NameValidationStatus.Valid)
      }
    }
    else {
      setUrlInput(value)
      setUrlValidationStatus(UrlValidationStatus.Unchecked)
      setUrlServerValidation(null)
      if (urlValidationTimeoutRef.current) {
        clearTimeout(urlValidationTimeoutRef.current)
        urlValidationTimeoutRef.current = null
      }
      if (!value) {
        return
      }
      if (!validateServerUrlFormat(value)) {
        setUrlValidationStatus(UrlValidationStatus.InvalidFormat)
        return
      }
      urlValidationTimeoutRef.current = setTimeout(async () => {
        setUrlValidationStatus(UrlValidationStatus.Checking)
        // logger.silly('handleChange.timeoutFunc', 'Validating url', inputVal, runId)
        const serverValidation = await window.electronAPI.validateServerUrl(value)
        // logger.silly('handleChange.timeoutFunc', 'Validation completed', inputVal, serverValid, urlValidationTimeoutRef.current, runId)
        if (urlValidationTimeoutRef.current != runId)
          return
        if (serverValidation != null) {
          setUrlValidationStatus(UrlValidationStatus.Valid)
          setUrlServerValidation(serverValidation)
        }
        else {
          setUrlValidationStatus(UrlValidationStatus.InvalidServer)
        }
      }, URL_VALIDATION_BEGIN_TIMEOUT)
      const runId = urlValidationTimeoutRef.current
    }
  }

  const handleEnterKeyDown = (field: 'name' | 'url') => (): void => {
    if (field === 'name') {
      urlInputRef.current?.focus()
    }
    else {
      onSend()
    }
  }

  // TODO: remove description and show information / feedback (for name field) text in a tooltip when hovering over input fields
  // TODO: improve name feedback: inform user about max-length and regex-check
  return (
    <div className={styles.bg}>
      <img className={styles.bgImage} src="static://dark_background.jpg" />
      <div className={styles.content}>
        <img className={styles.logo} src="static://logo_with_text.png" alt="grommunio" />
        <p className={`${styles.description} ${(urlInput || nameInput) ? styles.descriptionHidden : ''}`}>
          {t('mainWindow.startView.text.description')}
        </p>
        <InputField
          value={nameInput}
          type="text"
          className={styles.inputContainer}
          placeholder={t('mainWindow.startView.input.name.placeholder')}
          feedback={nameValidationStatus === NameValidationStatus.InvalidFormat ? t('mainWindow.startView.input.name.feedback.invalidFormat') : undefined}
          validationStatus={nameValidationStatus}
          onChange={handleChange('name')}
          onEnterKeyDown={handleEnterKeyDown('name')}
        />
        <InputField
          value={urlInput}
          type="url"
          className={styles.inputContainer}
          placeholder="https://mail.example.com"
          feedback={urlValidationFeedbackText}
          validationStatus={urlValidationStatus}
          ref={urlInputRef}
          disableSpellCheck={true}
          onChange={handleChange('url')}
          onEnterKeyDown={handleEnterKeyDown('url')}
        />
        <button className={styles.button} onClick={onSend} disabled={!isReadyToSubmit}>
          {t('mainWindow.startView.button.submit')}
        </button>
      </div>
    </div>
  )
}

export default StartPage
