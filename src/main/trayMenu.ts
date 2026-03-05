// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { nativeImage, Tray, Menu } from 'electron'

import { getExtraResourcesPath } from './utils/paths' // TODO: define fixed order for import statements (?)
import { systemPlatform } from './constants/system'
import { APP_PRODUCT_NAME } from './constants/app'

export default class TrayMenu {
  private readonly tray: Tray

  constructor(onOpenAppClick: () => void) {
    this.tray = new Tray(
      systemPlatform === 'win'
        ? nativeImage.createFromPath(getExtraResourcesPath('favicon.ico'))
        : systemPlatform === 'mac'
          ? nativeImage.createFromPath(getExtraResourcesPath('favicon_32x32@2x.png'))
          : nativeImage.createFromPath(getExtraResourcesPath('favicon_32x32.png')),
    )
    this.tray.setToolTip(APP_PRODUCT_NAME)
    // TODO: add translation to labels (also for appmenu)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open App',
        click: onOpenAppClick,
      },
      { role: 'quit' }, // TODO: check if there is no memory leak
    ])
    this.tray.setContextMenu(contextMenu)
  }
}
