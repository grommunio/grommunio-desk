// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { UserConfirmDialog, UserConfirmDialogButton } from './confirmDialog'
import { UserSelectDialog, UserSelectDialogButton } from './selectDialog'
import { UserInputDialog, UserInputDialogButton } from './inputDialog'

export type UserDialog = UserConfirmDialog | UserSelectDialog | UserInputDialog
export { UserConfirmDialog } from './confirmDialog'
export { UserSelectDialog } from './selectDialog'
export { UserInputDialog } from './inputDialog'

export type UserDialogButton<Optional extends boolean> = UserConfirmDialogButton | UserSelectDialogButton<Optional> | UserInputDialogButton<Optional>
export { UserConfirmDialogButton } from './confirmDialog'
export { UserSelectDialogButton } from './selectDialog'
export { UserInputDialogButton } from './inputDialog'
