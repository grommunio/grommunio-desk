// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { UserConfirmDialog, UserConfirmDialogButton } from './confirmDialog'
import { UserSelectDialog, UserSelectDialogButton } from './selectDialog'

export type UserDialog = UserConfirmDialog | UserSelectDialog
export { UserConfirmDialog } from './confirmDialog'
export { UserSelectDialog } from './selectDialog'

export type UserDialogButton<Optional extends boolean> = UserConfirmDialogButton | UserSelectDialogButton<Optional>
export { UserConfirmDialogButton } from './confirmDialog'
export { UserSelectDialogButton } from './selectDialog'
