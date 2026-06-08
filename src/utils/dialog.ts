// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { UserDialog } from '../types/dialog'
import { Server } from '../types/misc'
import { SelectFieldOption } from '../types/selectField'

type DialogArgs = {
  type: 'confirm.removeServer'
  args: { server: Server }
} | {
  type: 'confirm.loadFailed'
  args: { url: string }
} | {
  type: 'confirm.noMailtoServerFound'
  args: { mailtoUrl: string }
} | {
  type: 'select.mailto'
  args: { mailtoUrl: string, servers: SelectFieldOption<Server>[] }
} | {
  type: 'input.serverName'
  args: { server: Server }
}

export function createDialogObject(dialogArgs: DialogArgs): UserDialog {
  switch (dialogArgs.type) {
    case 'confirm.removeServer':
      return {
        type: 'confirm',
        title: 'confirm.removeServer',
        exitAllowed: true,
        text: 'confirm.removeServer',
        textArgs: dialogArgs.args,
        buttons: [
          { type: 'cancel', text: 'cancel' },
          { type: 'confirm.removeServer', callbackParams: dialogArgs.args, text: 'confirm.removeServer', triggerOnEnter: true },
        ],
      }
    case 'confirm.loadFailed':
      return {
        type: 'confirm',
        title: 'confirm.loadFailed',
        exitAllowed: false,
        text: 'confirm.loadFailed',
        textArgs: {
          url: dialogArgs.args.url,
          interpolation: { escapeValue: false },
        },
        buttons: [
          { type: 'confirm.returnToStartPage', text: 'confirm.returnToStartPage', triggerOnEnter: true },
        ],
      }
    case 'confirm.noMailtoServerFound':
      return {
        type: 'confirm',
        title: 'confirm.noMailtoServerFound',
        exitAllowed: true,
        text: 'confirm.noMailtoServerFound',
        textArgs: { mailtoEmail: dialogArgs.args.mailtoUrl.split('mailto:').pop() || '' },
        buttons: [
          { type: 'cancel', text: 'ok', triggerOnEnter: true },
        ],
      }
    case 'select.mailto':
      return {
        type: 'select',
        title: 'select.mailto',
        exitAllowed: true,
        text: 'select.mailto',
        textArgs: { mailtoEmail: dialogArgs.args.mailtoUrl.split('mailto:').pop() || '' },
        buttons: [
          { type: 'cancel', text: 'cancel' },
          { type: 'select.selectMailtoServer', callbackParams: { mailtoUrl: dialogArgs.args.mailtoUrl }, text: 'select.selectMailtoServer', triggerOnEnter: true },
        ],
        optionValues: dialogArgs.args.servers,
      }
    case 'input.serverName':
      return {
        type: 'input',
        title: 'input.serverName',
        exitAllowed: true,
        inputParams: { server: dialogArgs.args.server },
        buttons: [
          { type: 'cancel', text: 'cancel' },
          { type: 'input.editServerName', callbackParams: { server: dialogArgs.args.server }, text: 'input.editServerName', triggerOnEnter: true },
        ],
      }
  }
}
