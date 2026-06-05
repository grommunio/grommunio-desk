// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { UserTextDialogTemplate, UserDialogButtonTemplate, UserButtonDialogTemplate } from './templates'
import { UserDialogCancelButton } from './buttons'
import { ValidateDialogArgs } from './misc'
import { Server } from '../misc'
import { SelectFieldOption } from '../selectField'

// Optional field specifies whether the selection field is required
type UserSelectDialogButtonTemplate<
  Type extends string,
  Optional extends boolean,
  ReturnType,
  CallbackParams extends Record<string, unknown> | undefined = undefined,
> = UserDialogButtonTemplate<Type, CallbackParams>
  & (Optional extends true ? { selection?: ReturnType } : { selection: ReturnType })

type UserSelectDialogOpenEmailButton<Optional extends boolean> = UserSelectDialogButtonTemplate<'select.selectMailtoServer', Optional, Server, { mailtoUrl: string }>
type UserSelectDialogButtonExcl<Optional extends boolean> = UserSelectDialogOpenEmailButton<Optional>
export type UserSelectDialogButton<Optional extends boolean> = UserDialogCancelButton | UserSelectDialogButtonExcl<Optional>

export type UserSelectDialogSelection = UserSelectDialogButtonExcl<false>['selection']

interface UserSelectDialogArgsEntryGeneric<Button extends UserSelectDialogButtonExcl<true>> {
  optionValues: SelectFieldOption<Exclude<Button['selection'], undefined>>[]
  textArgs: Record<string, unknown> | undefined
  buttons: [UserDialogCancelButton, Button]
}
type UserSelectDialogArgsEntry<ButtonUnion extends UserSelectDialogButtonExcl<true> = UserSelectDialogButtonExcl<true>>
  = ButtonUnion extends infer U extends UserSelectDialogButtonExcl<true>
    ? UserSelectDialogArgsEntryGeneric<U>
    : never
type UserSelectDialogArgs = ValidateDialogArgs<UserSelectDialogArgsEntry, {
  'select.mailto': {
    optionValues: SelectFieldOption<Server>[]
    textArgs: { mailtoEmail: string }
    buttons: [
      { type: 'cancel', text: 'cancel' },
      { type: 'select.selectMailtoServer', callbackParams: { mailtoUrl: string }, text: 'select.selectMailtoServer', triggerOnEnter: true },
    ]
  }
}>

interface UserSelectDialogGeneric<SelectDialogType extends keyof UserSelectDialogArgs> extends
  UserTextDialogTemplate<'select', SelectDialogType, SelectDialogType, UserSelectDialogArgs[SelectDialogType]['textArgs']>,
  UserButtonDialogTemplate<'select', SelectDialogType, UserSelectDialogArgs[SelectDialogType]['buttons']> {
  optionValues: UserSelectDialogArgs[SelectDialogType]['optionValues']
}
export type UserSelectDialog = { [K in keyof UserSelectDialogArgs]: UserSelectDialogGeneric<K> }[keyof UserSelectDialogArgs]
