// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

import { UserDialogButtonTemplate, UserTextDialogTemplate, UserButtonDialogTemplate } from './templates'
import { UserDialogCancelButton } from './buttons'
import { Server } from '../misc'

type UserConfirmDialogReturnToStartPageButton = UserDialogButtonTemplate<'confirm.returnToStartPage'>
type UserConfirmDialogRemoveServerButton = UserDialogButtonTemplate<'confirm.removeServer', { server: Server }>
export type UserConfirmDialogButton = UserDialogCancelButton | UserConfirmDialogReturnToStartPageButton | UserConfirmDialogRemoveServerButton

interface UserConfirmDialogTextArgs {
  'confirm.loadFailed': { url: string, interpolation?: InterpolationOptions }
  'confirm.removeServer': { server: Server }
}
type UserConfirmDialogGeneric<Text extends keyof UserConfirmDialogTextArgs>
  = UserTextDialogTemplate<'confirm', Text, Text, UserConfirmDialogTextArgs[Text]>
    & UserButtonDialogTemplate<'confirm', Text, UserConfirmDialogButton[]>
export type UserConfirmDialog = { [K in keyof UserConfirmDialogTextArgs]: UserConfirmDialogGeneric<K> }[keyof UserConfirmDialogTextArgs]
