// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React, { useState } from 'react'

import Logger from '@utils/logger'

const logger = new Logger('renderer/mainWindow/mainView/StartPage')

const StartPage = (): React.ReactElement => {
  const [input, setInput] = useState('')

  const onSend = (): void => {
    logger.debug('onSend', `New server: ${input}`)
    window.electronAPI.saveServer(input)
  }

  return (
    <div>
      <div>grommunio Server</div>
      <input onInput={e => setInput((e.target as HTMLInputElement).value)} type="url" placeholder="https://mail.example.com" />
      <button onClick={onSend}>
        Send
      </button>
    </div>
  )
}

export default StartPage
