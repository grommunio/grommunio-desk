// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

type UserDialogText = 'loadFailed'

interface UserDialogButtonTemplate {
  name: string
  callbackParams?: unknown
  triggerOnEnter?: boolean
  triggerOnEscape?: boolean
}
interface UserDialogReturnToStartPageButton extends UserDialogButtonTemplate {
  name: 'returnToStartPage'
  callbackParams?: undefined
}
export type UserDialogButton = UserDialogReturnToStartPageButton

interface UserDialogTextArgs {
  loadFailed: { url: string, interpolation?: InterpolationOptions }
}

interface UserDialogGeneric<T extends UserDialogText> {
  text: T
  textArgs: UserDialogTextArgs[T]
  buttons: UserDialogButton[]
}
export type UserDialog = { [K in keyof UserDialogTextArgs]: UserDialogGeneric<K> }[keyof UserDialogTextArgs]
