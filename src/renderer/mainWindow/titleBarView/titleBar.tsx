// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React, { useRef, RefObject } from 'react'

import styles from './titleBar.module.css'
import { TITLE_BAR } from '../../../constants/window'

const TitleBar = (): React.ReactElement => {
  const menuButtonRef = useRef(null) as unknown as RefObject<HTMLDivElement>

  const onAppMenuClose = (): void => {
    menuButtonRef.current.blur()
  }
  window.electronAPI.onAppMenuClose(onAppMenuClose)

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
      >
      </div>
    </div>
  )
}

export default TitleBar
