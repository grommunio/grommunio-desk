// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { InterpolationOptions } from 'i18next'

type UserNotifcationText = 'loadFailed'

export type UserNotificationButton = 'returnToStartPage'

interface UserNotificationTextArgs {
  loadFailed: { url: string, interpolation?: InterpolationOptions }
}

interface UserNotificationGeneric<T extends UserNotifcationText> {
  text: T
  textArgs: UserNotificationTextArgs[T]
  buttons: UserNotificationButton[]
}

export type UserNotification = { [K in keyof UserNotificationTextArgs]: UserNotificationGeneric<K> }[keyof UserNotificationTextArgs]
