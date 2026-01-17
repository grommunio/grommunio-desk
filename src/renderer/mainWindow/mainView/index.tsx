// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import StartPage from './StartPage'
import '../../i18n/i18n'

const Root = (): React.ReactElement => {
  return (
    <StartPage />
  )
}

const root = createRoot(document.body)
root.render(<Root />)
