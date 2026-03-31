// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

// ipcRenderer.send one-way
export const ADD_SERVER = 'add_server'
export const LOAD_NEW_SERVER = 'load_new_server'
export const SWITCH_SERVER = 'switch_server'
export const TOGGLE_APP_MENU = 'toggle_app_menu'
export const HANDLE_DIALOG_BUTTON = 'handle_dialog_button'
export const SET_TITLE_BAR_SERVER_MENU_OPEN = 'set_title_bar_server_menu_open'
export const OPEN_DIALOG = 'open_dialog'
export const EXIT_DIALOG = 'exit_dialog'

// ipcRenderer.sendSync two-way (synchronous)
export const GET_SYSTEM_PLATFORM = 'get_system_platform'

// ipcRenderer.invoke two-way (asynchronous)
export const VALIDATE_SERVER_URL = 'validate_server_url'

// ipcRenderer.on one-way
export const ON_APP_MENU_CLOSE = 'on_app_menu_close'
export const ON_SERVER_SWITCH = 'on_server_switch'
export const ON_SERVER_SAVE = 'on_server_save'
export const ON_DIALOG_OPEN = 'on_dialog_open'
export const ON_DIALOG_CHANGE = 'on_dialog_change'
