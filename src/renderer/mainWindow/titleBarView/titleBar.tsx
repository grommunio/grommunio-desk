// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useRef, RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './titleBar.module.css'
import { TITLE_BAR } from '../../../constants/window'
import { ServerURL } from '../../../types/misc'

const TitleBar = (): React.ReactElement => {
  const { t } = useTranslation()
  const [isSwitchServerButtonDisabled, setSwitchServerButtonDisabled] = useState(true)
  const menuButtonRef = useRef(null) as unknown as RefObject<HTMLDivElement>

  useEffect(() => {
    window.electronAPI.onAppMenuClose(onAppMenuClose)
    window.electronAPI.onServerSwitch(onServerSwitch)
  }, [])

  const onSwitchServerClick = (): void => {
    window.electronAPI.saveServer(undefined)
  }

  // IPC functions
  const onAppMenuClose = (): void => {
    menuButtonRef.current.blur()
  }
  // onSwitchServerClick is not the only method to switch servers (e.g. via app menu), so it's necessary to listen on server switching
  const onServerSwitch = (server: ServerURL): void => {
    setSwitchServerButtonDisabled(server == null)
  }

  return (
    <div
      className={styles.titleBarDiv}
      style={{
        color: TITLE_BAR.COLOR,
        backgroundColor: TITLE_BAR.BACKGROUND_COLOR,
        height: TITLE_BAR.HEIGHT,
      }}
    >
      <div
        className={styles.menuButton}
        ref={menuButtonRef}
        onClick={window.electronAPI.toggleAppMenu}
      />
      <button
        className={styles.switchServerButton}
        disabled={isSwitchServerButtonDisabled}
        onClick={onSwitchServerClick}
      >
        {t('mainWindow.titleBarView.switchServer')}
      </button>
    </div>
  )
}

export default TitleBar
