// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './startPage.module.css'
import Logger from '@utils/logger'
import { validateServerNameFormat, validateServerUrlFormat } from '@utils/server'
import { ServerOptions, ServerSystem } from '../../../types/misc'
import InputField, { ValidationStatus as InputFieldValidationStatus } from '../../components/inputField'

type UrlValidationStatus = 'unchecked' | 'invalidFormat' | 'checking' | 'invalidServer' | 'valid'
type NameValidationStatus = 'unchecked' | 'invalidFormat' | 'valid'

const logger = new Logger('renderer/mainWindow/startView/startPage')
const URL_VALIDATION_BEGIN_TIMEOUT = 400
const URL_VALIDATION_STATUS_MAP: Record<UrlValidationStatus, InputFieldValidationStatus> = {
  unchecked: 'unchecked',
  invalidFormat: 'invalid',
  checking: 'checking',
  invalidServer: 'warn',
  valid: 'valid',
}
const NAME_VALIDATION_STATUS_MAP: Record<NameValidationStatus, InputFieldValidationStatus> = {
  unchecked: 'unchecked',
  invalidFormat: 'invalid',
  valid: 'valid',
}

const StartPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [urlInput, setUrlInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [urlValidationStatus, setUrlValidationStatus] = useState<UrlValidationStatus>('unchecked')
  const [nameValidationStatus, setNameValidationStatus] = useState<NameValidationStatus>('unchecked')
  const [urlServerSystem, setUrlServerSystem] = useState<ServerSystem | null>(null)
  const urlValidationTimeoutRef = useRef<NodeJS.Timeout>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const isReadyToSubmit = useMemo(() => ['invalidServer', 'valid'].includes(urlValidationStatus) && nameValidationStatus === 'valid', [urlValidationStatus, nameValidationStatus])
  const urlValidationFeedbackText = useMemo(() =>
    urlValidationStatus === 'valid'
      ? `${t(`mainWindow.startView.input.url.feedback.valid.${urlServerSystem?.type}`)}: ${t(`mainWindow.startView.input.url.feedback.valid.version`, { system: urlServerSystem })}`
      : urlValidationStatus === 'invalidFormat'
        ? t('mainWindow.startView.input.url.feedback.invalidFormat')
        : urlValidationStatus === 'invalidServer'
          ? t('mainWindow.startView.input.url.feedback.invalidServer')
          : undefined,
  [urlValidationStatus, urlServerSystem])

  const onSend = async (): Promise<void> => {
    if (!isReadyToSubmit)
      return

    const server: ServerOptions = {
      url: urlInput,
      name: nameInput,
      system: urlServerSystem,
    }
    logger.debug('onSend', 'New server:', server)
    window.electronAPI.loadNewServer(server)
  }

  const handleChange = (field: 'name' | 'url') => (value: string): void => {
    if (field === 'name') {
      setNameInput(value)
      if (!value) {
        setNameValidationStatus('unchecked')
      }
      else if (!validateServerNameFormat(value)) {
        setNameValidationStatus('invalidFormat')
      }
      else {
        setNameValidationStatus('valid')
      }
    }
    else {
      setUrlInput(value)
      setUrlValidationStatus('unchecked')
      setUrlServerSystem(null)
      if (urlValidationTimeoutRef.current) {
        clearTimeout(urlValidationTimeoutRef.current)
        urlValidationTimeoutRef.current = null
      }
      if (!value) {
        return
      }
      if (!validateServerUrlFormat(value)) {
        setUrlValidationStatus('invalidFormat')
        return
      }
      urlValidationTimeoutRef.current = setTimeout(async () => {
        setUrlValidationStatus('checking')
        // logger.silly('handleChange.timeoutFunc', 'Validating url', inputVal, runId)
        const serverValidation = await window.electronAPI.validateServerUrl(value)
        // logger.silly('handleChange.timeoutFunc', 'Validation completed', inputVal, serverValid, urlValidationTimeoutRef.current, runId)
        if (urlValidationTimeoutRef.current != runId)
          return
        if (serverValidation != null) {
          setUrlValidationStatus('valid')
          setUrlServerSystem(serverValidation)
        }
        else {
          setUrlValidationStatus('invalidServer')
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
          feedback={nameValidationStatus === 'invalidFormat' ? t('mainWindow.startView.input.name.feedback.invalidFormat') : undefined}
          validationStatus={NAME_VALIDATION_STATUS_MAP[nameValidationStatus]}
          onChange={handleChange('name')}
          onEnterKeyDown={handleEnterKeyDown('name')}
        />
        <InputField
          value={urlInput}
          type="url"
          className={styles.inputContainer}
          placeholder="https://mail.example.com"
          feedback={urlValidationFeedbackText}
          validationStatus={URL_VALIDATION_STATUS_MAP[urlValidationStatus]}
          ref={urlInputRef}
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
