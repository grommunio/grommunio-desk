// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

import { Server } from './misc'

interface UserDialogButtonTemplate {
  type: string
  callbackParams?: unknown
  triggerOnEnter?: boolean
  triggerOnEscape?: boolean
}
interface UserDialogReturnToStartPageButton extends UserDialogButtonTemplate {
  type: 'returnToStartPage'
  callbackParams?: undefined
}
interface UserDialogCancelButton extends UserDialogButtonTemplate {
  type: 'cancel'
  callbackParams?: undefined
}
interface UserDialogRemoveServerButton extends UserDialogButtonTemplate {
  type: 'removeServer'
  callbackParams: { server: Server }
}
export type UserDialogButton = UserDialogReturnToStartPageButton | UserDialogCancelButton | UserDialogRemoveServerButton

interface UserDialogTextArgs {
  loadFailed: { url: string, interpolation?: InterpolationOptions }
  removeServer: { server: Server }
}
interface UserDialogGeneric<T extends keyof UserDialogTextArgs> {
  text: T
  textArgs: UserDialogTextArgs[T]
  buttons: UserDialogButton[]
}
export type UserDialog = { [K in keyof UserDialogTextArgs]: UserDialogGeneric<K> }[keyof UserDialogTextArgs]
