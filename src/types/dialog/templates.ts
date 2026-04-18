// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

interface UserDialogTemplate<Type extends string, Title extends string> {
  type: Type
  title: Title
  exitAllowed: boolean
}
export interface UserTextDialogTemplate<Type extends string, Title extends string, DialogText extends string, DialogTextArgs extends Record<string, unknown> | undefined> extends UserDialogTemplate<Type, Title> {
  text: DialogText
  textArgs: DialogTextArgs
}

export type UserDialogButtonTemplate<Type extends string, CallbackParams extends Record<string, unknown> | undefined = undefined> = {
  type: Type
  triggerOnEnter?: boolean
} & (CallbackParams extends undefined
  ? { callbackParams?: undefined }
  : { callbackParams: CallbackParams })

export interface UserButtonDialogTemplate<Type extends string, Title extends string, Buttons extends UserDialogButtonTemplate<string, Record<string, unknown> | undefined>[]> extends UserDialogTemplate<Type, Title> {
  buttons: Buttons
}
