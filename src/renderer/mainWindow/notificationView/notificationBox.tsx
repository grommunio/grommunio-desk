// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './notificationBox.module.css'
import { UserNotification } from '../../../types/userNotification'
import Logger from '../../utils/logger'

const logger = new Logger('renderer/mainWindow/notificationView/notificationBox')

const NotificationBox = (): React.ReactElement => {
  const { t } = useTranslation()
  const [notification, setNotification] = useState<UserNotification | undefined>(undefined)
  const buttons = useMemo(() => notification
    ? notification.buttons.map((button, idx) => (
        <button className={styles.button} onClick={() => window.electronAPI.handleNotificationButton(button)} key={`button-${idx}`}>
          {t(`mainWindow.notificationView.${button}Button`)}
        </button>
      ))
    : [],
  [notification])

  useEffect(() => {
    window.electronAPI.onNotification(onNotification)
  }, [])

  // IPC functions
  const onNotification = (notification: UserNotification): void => {
    logger.silly('onNotification', 'New notification', notification)
    setNotification(notification)
  }

  return (
    <div className={styles.bg}>
      <div className={styles.notificationDiv}>
        <div className={styles.textDiv}>
          {
            notification
              ? t(`mainWindow.notificationView.${notification.text}Message`, notification.textArgs)
              : ''
          }
        </div>
        <div className={styles.separator} />
        <div className={styles.buttonDiv}>
          {buttons}
        </div>
      </div>
    </div>
  )
}

export default NotificationBox
