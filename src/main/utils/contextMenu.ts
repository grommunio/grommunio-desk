// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { Menu, MenuItemConstructorOptions, WebContents } from 'electron'

export const attachContextMenu = (webContents: WebContents): void => {
  webContents.on('context-menu', (_event, params) => {
    const template: MenuItemConstructorOptions[] = []

    if (params.misspelledWord) {
      template.push(
        ...params.dictionarySuggestions.map(
          suggestion => ({ label: suggestion, click: (): void => webContents.replaceMisspelling(suggestion) }),
        ),
      )
      if (params.dictionarySuggestions.length === 0) {
        template.push({ label: 'No suggestions', enabled: false })
      }
      template.push({ type: 'separator' })
      template.push({
        label: 'Add to Dictionary',
        click: (): void => {
          webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        },
      })
      template.push({ type: 'separator' })
    }

    template.push(
      { role: 'cut', enabled: params.editFlags.canCut },
      { role: 'copy', enabled: params.editFlags.canCopy },
      { role: 'paste', enabled: params.editFlags.canPaste },
      { type: 'separator' },
      { role: 'selectAll', enabled: params.editFlags.canSelectAll },
    )

    const menu = Menu.buildFromTemplate(template)
    menu.popup()
  })
}
