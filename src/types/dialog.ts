// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

import { Server } from './misc'

type UserDialogTitle = 'loadFailed' | 'removeServer'
export interface UserDialogTemplate {
  type: string
  title: UserDialogTitle
  exitAllowed: boolean
}

interface UserConfirmDialogButtonTemplate {
  type: string
  callbackParams?: unknown
  triggerOnEnter?: boolean
}
interface UserConfirmDialogReturnToStartPageButton extends UserConfirmDialogButtonTemplate {
  type: 'returnToStartPage'
  callbackParams?: undefined
}
interface UserConfirmDialogCancelButton extends UserConfirmDialogButtonTemplate {
  type: 'cancel'
  callbackParams?: undefined
}
interface UserConfirmDialogRemoveServerButton extends UserConfirmDialogButtonTemplate {
  type: 'removeServer'
  callbackParams: { server: Server }
}
export type UserConfirmDialogButton = UserConfirmDialogReturnToStartPageButton | UserConfirmDialogCancelButton | UserConfirmDialogRemoveServerButton

interface UserConfirmDialogTextArgs {
  loadFailed: { url: string, interpolation?: InterpolationOptions }
  removeServer: { server: Server }
}
interface UserConfirmDialogGeneric<T extends keyof UserConfirmDialogTextArgs> extends UserDialogTemplate {
  type: 'confirm'
  text: T
  textArgs: UserConfirmDialogTextArgs[T]
  buttons: UserConfirmDialogButton[]
}
export type UserConfirmDialog = { [K in keyof UserConfirmDialogTextArgs]: UserConfirmDialogGeneric<K> }[keyof UserConfirmDialogTextArgs]

export type UserDialog = UserConfirmDialog
