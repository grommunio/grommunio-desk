// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './titleBar.module.css'
import { TITLE_BAR } from '../../../constants/window'
import { Server } from '../../../types/misc'
import ServerIcon from './icons/serverIcon'
import RemoveIcon from './icons/removeIcon'
import EditIcon from './icons/editIcon'
import { createDialogObject } from '../../../utils/dialog'
import ServerTypeIcon from './serverTypeIcon'

const formatServerLabel = (server?: Server): string => {
  if (!server)
    return 'No server'
  return server.name
}

const TitleBar = (): React.ReactElement => {
  const { t } = useTranslation()
  const appMenuButtonRef = useRef<HTMLDivElement>(null)
  const [isServerMenuOpen, setServerMenuOpen] = useState(false)
  const [servers, setServers] = useState<Server[]>([])
  const [currentServer, setCurrentServer] = useState<Server | undefined>(undefined)
  const [isDisabled, setDisabled] = useState(false)
  const currentServerName = useMemo(() => formatServerLabel(currentServer), [currentServer])
  const formattedServers = useMemo(() => {
    return servers.map(server => ({
      ...server,
      formattedLabel: formatServerLabel(server),
    }))
  }, [servers])
  const isMacPlatform = useMemo(() => window.electronAPI.getSystemPlatform() === 'mac', [window])

  useEffect(() => {
    window.electronAPI.onAppMenuClose(onAppMenuClose)
    window.electronAPI.onServerSwitch(onServerSwitch)
    window.electronAPI.onServerSave(onServerSave)
    window.electronAPI.onDialogChange(onDialogChange)
  }, [])

  const onToggleServerMenu = (): void => {
    const next = !isServerMenuOpen
    setServerMenuOpen(next)
    window.electronAPI.setTitleBarServerMenuOpen(next)
  }

  const closeServerMenu = (): void => {
    setServerMenuOpen(false)
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

  const onEditServerClick = (server: Server): void => {
    window.electronAPI.openDialog(createDialogObject({ type: 'input.serverName', args: { server } }))
  }

  const onRemoveServerClick = (server: Server): void => {
    window.electronAPI.openDialog(createDialogObject({ type: 'confirm.removeServer', args: { server } }))
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

  const onDialogChange = (isDialogOpen: boolean): void => {
    setDisabled(isDialogOpen)
    if (isDialogOpen)
      closeServerMenu()
  }

  // TODO: bug: when buttons are disabled (isDisabled === true) and dev tools is opened, the view disappears
  // TODO: bug: when titleBar is focused and the Tab key is pressed, the view also disappears
  return (
    <div
      className={`${styles.titleBarDiv} ${isMacPlatform ? styles.titleBarMac : ''}`}
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
      {!isMacPlatform && (
        <div
          className={styles.appMenuButton}
          ref={appMenuButtonRef}
          onClick={window.electronAPI.toggleAppMenu}
        />
      )}
      <div className={styles.serverChooser}>
        <button
          className={styles.serverButton}
          type="button"
          onClick={onToggleServerMenu}
          disabled={isDisabled}
        >
          <div className={styles.serverIcon}>
            {currentServer !== undefined ? <ServerTypeIcon system={currentServer.system} /> : <ServerIcon />}
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
            <span>{t('mainWindow.titleBarView.servers')}</span>
          </div>
          <div className={styles.serverMenuDivider} />
          {servers.length > 0 && (
            <>
              {formattedServers.map(server => (
                <div className={styles.serverMenuElement} key={server.id}>
                  <button
                    className={styles.serverMenuItemButton}
                    onClick={() => onServerClick(server)}
                  >
                    <span className={styles.serverMenuCheck}>
                      {currentServer?.id === server.id ? '✓' : <ServerTypeIcon system={server.system} />}
                    </span>
                    <span className={styles.serverMenuLabel}>
                      {server.formattedLabel}
                    </span>
                  </button>
                  <button
                    className={`${styles.serverMenuButton} ${styles.editButton}`}
                    onClick={() => onEditServerClick(server)}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className={`${styles.serverMenuButton} ${styles.removeButton}`}
                    onClick={() => onRemoveServerClick(server)}
                  >
                    <RemoveIcon />
                  </button>
                </div>
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
