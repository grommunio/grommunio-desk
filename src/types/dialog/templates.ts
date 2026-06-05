// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

// general dialog template
interface UserDialogTemplate<Type extends string, Title extends string> {
  type: Type
  title: Title
  exitAllowed: boolean
}

// text dialog template
export interface UserTextDialogTemplate<Type extends string, Title extends string, DialogText extends string, DialogTextArgs extends Record<string, unknown> | undefined> extends UserDialogTemplate<Type, Title> {
  text: DialogText
  textArgs: DialogTextArgs
}

// button template
export type UserDialogButtonTemplate<Type extends string, CallbackParams extends Record<string, unknown> | undefined = undefined, Text extends string = Type> = {
  type: Type
  text: Text
  triggerOnEnter?: boolean
  disabled?: boolean
} & (CallbackParams extends undefined
  ? { callbackParams?: undefined }
  : { callbackParams: CallbackParams })

// button dialog template
export interface UserButtonDialogTemplate<Type extends string, Title extends string, Buttons extends UserDialogButtonTemplate<string, Record<string, unknown> | undefined>[]> extends UserDialogTemplate<Type, Title> {
  buttons: Buttons
}
