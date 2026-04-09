// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

import { Server } from './misc'

type UserDialogTitle = 'loadFailed' | 'removeServer'
interface UserDialogTemplate<Type> {
  type: Type
  title: UserDialogTitle
  exitAllowed: boolean
}
interface UserTextDialogTemplate<Type, DialogTextArgs, DialogText extends keyof DialogTextArgs> extends UserDialogTemplate<Type> {
  text: DialogText
  textArgs: DialogTextArgs[DialogText]
}
type UserDialogButtonTemplate<Type, CallbackParams = undefined> = {
  type: Type
  triggerOnEnter?: boolean
} & (CallbackParams extends undefined
  ? { callbackParams?: undefined }
  : { callbackParams: CallbackParams })
type UserDialogCancelButton = UserDialogButtonTemplate<'cancel'>
interface UserButtonDialogTemplate<Type, Button> extends UserDialogTemplate<Type> {
  buttons: Button[]
}

type UserConfirmDialogReturnToStartPageButton = UserDialogButtonTemplate<'confirm.returnToStartPage'>
type UserConfirmDialogRemoveServerButton = UserDialogButtonTemplate<'confirm.removeServer', { server: Server }>
type UserConfirmDialogButton = UserDialogCancelButton | UserConfirmDialogReturnToStartPageButton | UserConfirmDialogRemoveServerButton
interface UserConfirmDialogTextArgs {
  'confirm.loadFailed': { url: string, interpolation?: InterpolationOptions }
  'confirm.removeServer': { server: Server }
}
type UserConfirmDialogGeneric<Text extends keyof UserConfirmDialogTextArgs>
  = UserTextDialogTemplate<'confirm', UserConfirmDialogTextArgs, Text>
    & UserButtonDialogTemplate<'confirm', UserConfirmDialogButton>
export type UserConfirmDialog = { [K in keyof UserConfirmDialogTextArgs]: UserConfirmDialogGeneric<K> }[keyof UserConfirmDialogTextArgs]

export type UserDialog = UserConfirmDialog
export type UserDialogButton = UserConfirmDialogButton
