// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import Dialog from './dialog'
import '../../i18n/i18n'

const Root = (): React.ReactElement => {
  return (
    <Dialog />
  )
}

const root = createRoot(document.body)
root.render(<Root />)
