// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

// redundant code to avoid ./src dependencies
export const systemPlatform = process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'
export type SystemPlatform = 'linux' | 'mac' | 'win'

export const STATIC_RESOURCES = [
  './assets/general/icons/icon_512x512.png', // about-panel icon
  './assets/windows/favicon_256x256_all.ico', // win trayicon
  './assets/general/favicons/favicon_32x32.png', // linux trayicon
  './assets/general/favicons/favicon_16x16.png', // mac trayicon
  './assets/os_icons/app_icon.png', // linux icon
]
