// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { ChangeEvent, useEffect, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './StartPage.module.css'
import Logger from '@utils/logger'
import { ServerOptions } from '../../../types/misc'
import logoImg from '../../../../assets/general/logo_with_text.png'
import backgroundImg from '../../../../assets/general/dark_background.jpg'

const logger = new Logger('renderer/mainWindow/startView/StartPage')
const URL_REGEX_PATTERN = /^https:\/\/([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-z]+(?::[0-9]+)?(?:\/[^\s]*)?$/i
const URL_VALIDATION_BEGIN_TIMEOUT = 400

const StartPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [urlInput, setUrlInput] = useState('')
  const [urlValidationStatus, setUrlValidationStatus] = useState<'notChecked' | 'invalidFormat' | 'checking' | 'invalidServer' | 'valid'>('notChecked')
  const urlValidationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUrlValid = useMemo(() => ['invalidServer', 'valid'].includes(urlValidationStatus), [urlValidationStatus])
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
    if (!isUrlValid)
      return

    const server: ServerOptions = { url: urlInput }
    logger.debug('onSend', 'New server:', server)
    window.electronAPI.saveServerAndReload(server)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value
    setUrlInput(val)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      onSend()
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

  return (
    <div className={styles.bg}>
      <img className={styles.bgImage} src={backgroundImg} />
      <div className={styles.content}>
        <img className={styles.logo} src={logoImg} alt="grommunio" />
        <p className={`${styles.description} ${urlInput ? styles.descriptionHidden : ''}`}>
          {t('mainWindow.startView.description')}
        </p>
        <input
          className={styles.input}
          value={urlInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
        <button className={styles.button} onClick={onSend} disabled={!isUrlValid}>
          {t('mainWindow.startView.submit')}
        </button>
      </div>
    </div>
  )
}

export default StartPage
