// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

type UserNotifcationText = 'loadFailed'

export type UserNotificationButton = 'returnToStartPage'

interface UserNotificationTextArgs {
  loadFailed: { url: string }
}

interface UserNotificationGeneric<T extends UserNotifcationText> {
  text: T
  textArgs: UserNotificationTextArgs[T]
  buttons: UserNotificationButton[]
}

export type UserNotification = { [K in keyof UserNotificationTextArgs]: UserNotificationGeneric<K> }[keyof UserNotificationTextArgs]
