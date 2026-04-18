// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

import { UserDialogButtonTemplate, UserTextDialogTemplate, UserButtonDialogTemplate } from './templates'
import { UserDialogCancelButton } from './buttons'
import { ValidateDialogArgs } from './misc'
import { Server } from '../misc'

type UserConfirmDialogReturnToStartPageButton = UserDialogButtonTemplate<'confirm.returnToStartPage'>
type UserConfirmDialogRemoveServerButton = UserDialogButtonTemplate<'confirm.removeServer', { server: Server }>
export type UserConfirmDialogButton = UserDialogCancelButton | UserConfirmDialogReturnToStartPageButton | UserConfirmDialogRemoveServerButton

interface UserConfirmDialogArgsEntry {
  textArgs: Record<string, unknown> | undefined
  buttons: UserConfirmDialogButton[]
}
type UserConfirmDialogArgs = ValidateDialogArgs<UserConfirmDialogArgsEntry, {
  'confirm.loadFailed': {
    textArgs: { url: string, interpolation?: InterpolationOptions }
    buttons: [{ type: 'confirm.returnToStartPage', triggerOnEnter: true }]
  }
  'confirm.removeServer': {
    textArgs: { server: Server }
    buttons: [{ type: 'cancel' }, { type: 'confirm.removeServer', callbackParams: { server: Server }, triggerOnEnter: true }]
  }
}>

type UserConfirmDialogGeneric<ConfirmDialogType extends Extract<keyof UserConfirmDialogArgs, string>>
  = UserTextDialogTemplate<'confirm', ConfirmDialogType, ConfirmDialogType, UserConfirmDialogArgs[ConfirmDialogType]['textArgs']>
    & UserButtonDialogTemplate<'confirm', ConfirmDialogType, UserConfirmDialogArgs[ConfirmDialogType]['buttons']>
export type UserConfirmDialog = { [K in keyof UserConfirmDialogArgs]: UserConfirmDialogGeneric<K> }[keyof UserConfirmDialogArgs]
