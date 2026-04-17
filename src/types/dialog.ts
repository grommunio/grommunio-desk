// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

import { Server } from './misc'

interface UserDialogTemplate<Type extends string, Title extends string> {
  type: Type
  title: Title
  exitAllowed: boolean
}
interface UserTextDialogTemplate<Type extends string, Title extends string, DialogText extends string, DialogTextArgs extends Record<string, unknown> | undefined> extends UserDialogTemplate<Type, Title> {
  text: DialogText
  textArgs: DialogTextArgs
}
type UserDialogButtonTemplate<Type extends string, CallbackParams extends Record<string, unknown> | undefined = undefined> = {
  type: Type
  triggerOnEnter?: boolean
} & (CallbackParams extends undefined
  ? { callbackParams?: undefined }
  : { callbackParams: CallbackParams })
type UserDialogCancelButton = UserDialogButtonTemplate<'cancel'>
interface UserButtonDialogTemplate<Type extends string, Title extends string, Buttons extends UserDialogButtonTemplate<string, Record<string, unknown> | undefined>[]> extends UserDialogTemplate<Type, Title> {
  buttons: Buttons
}

type UserConfirmDialogReturnToStartPageButton = UserDialogButtonTemplate<'confirm.returnToStartPage'>
type UserConfirmDialogRemoveServerButton = UserDialogButtonTemplate<'confirm.removeServer', { server: Server }>
type UserConfirmDialogButton = UserDialogCancelButton | UserConfirmDialogReturnToStartPageButton | UserConfirmDialogRemoveServerButton
interface UserConfirmDialogTextArgs {
  'confirm.loadFailed': { url: string, interpolation?: InterpolationOptions }
  'confirm.removeServer': { server: Server }
}
type UserConfirmDialogGeneric<Text extends keyof UserConfirmDialogTextArgs>
  = UserTextDialogTemplate<'confirm', Text, Text, UserConfirmDialogTextArgs[Text]>
    & UserButtonDialogTemplate<'confirm', Text, UserConfirmDialogButton[]>
export type UserConfirmDialog = { [K in keyof UserConfirmDialogTextArgs]: UserConfirmDialogGeneric<K> }[keyof UserConfirmDialogTextArgs]

export type UserDialog = UserConfirmDialog
export type UserDialogButton = UserConfirmDialogButton
