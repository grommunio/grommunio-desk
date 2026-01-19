// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import TitleBar from './titleBar'
import '../../i18n/i18n'

const Root = (): React.ReactElement => {
  return (
    <TitleBar />
  )
}

const root = createRoot(document.body)
root.render(<Root />)
