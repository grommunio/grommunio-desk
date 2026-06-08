// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { UserDialogButtonTemplate, UserButtonDialogTemplate } from './templates'
import { UserDialogCancelButton } from './buttons'
import { ValidateDialogArgs } from './misc'
import { Server } from '../misc'

// Optional field specifies whether the input field is required
type UserInputDialogButtonTemplate<
  Type extends string,
  Optional extends boolean,
  ReturnType extends Record<string, unknown>,
  CallbackParams extends Record<string, unknown> | undefined = undefined,
> = UserDialogButtonTemplate<Type, CallbackParams>
  & (Optional extends true ? { input?: ReturnType } : { input: ReturnType })

type UserInputDialogEditServerButton<Optional extends boolean> = UserInputDialogButtonTemplate<'input.editServerName', Optional, { name: string }, { server: Server }>
export type UserInputDialogButton<Optional extends boolean> = UserDialogCancelButton | UserInputDialogEditServerButton<Optional>

interface UserInputDialogArgsEntry {
  inputParams: Record<string, unknown> | undefined
  buttons: UserInputDialogButton<true>[]
}
type UserInputDialogArgs = ValidateDialogArgs<UserInputDialogArgsEntry, {
  'input.serverName': {
    inputParams: { server: Server }
    buttons: [
      { type: 'cancel', text: 'cancel' },
      { type: 'input.editServerName', callbackParams: { server: Server }, text: 'input.editServerName', triggerOnEnter: true },
    ]
  }
}>

interface UserInputDialogGeneric<InputDialogType extends Extract<keyof UserInputDialogArgs, string>>
  extends UserButtonDialogTemplate<'input', InputDialogType, UserInputDialogArgs[InputDialogType]['buttons']> {
  inputParams: UserInputDialogArgs[InputDialogType]['inputParams']
}
export type UserInputDialog<InputDialogType extends keyof UserInputDialogArgs = keyof UserInputDialogArgs> = InputDialogType extends undefined
  ? { [K in keyof UserInputDialogArgs]: UserInputDialogGeneric<K> }[keyof UserInputDialogArgs]
  : UserInputDialogGeneric<InputDialogType>
