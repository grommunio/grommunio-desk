// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './titleBar.module.css'
import { TITLE_BAR } from '../../../constants/window'
import { Server } from '../../../types/misc'
import ServerIcon from './serverIcon'

const formatServerLabel = (server?: Server): string => {
  if (!server)
    return 'No server'
  return server.name
}

const TitleBar = (): React.ReactElement => {
  const { t } = useTranslation()
  const appMenuButtonRef = useRef<HTMLDivElement>(null)
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false)
  const [servers, setServers] = useState<Server[]>([])
  const [currentServer, setCurrentServer] = useState<Server | undefined>(undefined)
  const currentServerName = useMemo(() => formatServerLabel(currentServer), [currentServer])
  const formattedServers = useMemo(() => {
    return servers.map(server => ({
      ...server,
      formattedLabel: formatServerLabel(server),
    }))
  }, [servers])

  useEffect(() => {
    window.electronAPI.onAppMenuClose(onAppMenuClose)
    window.electronAPI.onServerSwitch(onServerSwitch)
    window.electronAPI.onServerSave(onServerSave)
  }, [])

  const onToggleServerMenu = (): void => {
    const next = !isServerMenuOpen
    setIsServerMenuOpen(next)
    window.electronAPI.setTitleBarServerMenuOpen(next)
  }

  const closeServerMenu = (): void => {
    setIsServerMenuOpen(false)
    window.electronAPI.setTitleBarServerMenuOpen(false)
  }

  const onServerMenuBackdropMouseDown = (): void => {
    closeServerMenu()
  }

  const onAddServerClick = (): void => {
    closeServerMenu()
    window.electronAPI.addServer()
  }

  const onServerClick = (server: Server): void => {
    closeServerMenu()
    window.electronAPI.switchServer(server)
  }

  // IPC functions
  const onAppMenuClose = (): void => {
    appMenuButtonRef.current?.blur()
  }

  const onServerSwitch = (server: Server | undefined): void => {
    setCurrentServer(server)
  }

  const onServerSave = (savedServers: Server[]): void => {
    setServers(savedServers)
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
      {isServerMenuOpen && (
        <div
          className={styles.serverMenuBackdrop}
          onMouseDown={onServerMenuBackdropMouseDown}
        />
      )}
      <div
        className={styles.appMenuButton}
        ref={appMenuButtonRef}
        onClick={window.electronAPI.toggleAppMenu}
      />
      <div className={styles.serverChooser}>
        <button
          className={styles.serverButton}
          type="button"
          onClick={onToggleServerMenu}
        >
          <div className={styles.serverIcon}>
            <ServerIcon />
          </div>
          <span className={styles.serverName}>{currentServerName}</span>
          <span className={styles.serverCaret} />
        </button>
        <div
          className={`${styles.serverMenu} ${isServerMenuOpen ? styles.serverMenuOpen : ''}`}
          style={{
            backgroundColor: TITLE_BAR.BACKGROUND_COLOR,
            color: TITLE_BAR.COLOR,
          }}
        >
          <div className={styles.serverMenuHeader}>
            <span>Servers</span>
          </div>
          <div className={styles.serverMenuDivider} />
          {servers.length > 0 && (
            <>
              {formattedServers.map(server => (
                <button
                  key={server.id}
                  className={styles.serverMenuItemButton}
                  onClick={() => onServerClick(server)}
                >
                  <span className={styles.serverMenuCheck}>{currentServer?.id === server.id ? '✓' : ''}</span>
                  <span className={styles.serverMenuLabel}>{server.formattedLabel}</span>
                </button>
              ))}
              <div className={styles.serverMenuDivider} />
            </>
          )}
          <button className={styles.serverMenuItemButton} type="button" onClick={onAddServerClick}>
            <span className={styles.serverMenuAddContent}>
              <span className={styles.serverMenuAddIcon}>+</span>
              <span className={styles.serverMenuAddLabel}>{t('mainWindow.titleBarView.addServer')}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TitleBar
