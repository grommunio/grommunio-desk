// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainPage from './components/MainPage'

const Root = (): React.ReactElement => {
  return (
    <MainPage />
  )
}

const root = createRoot(document.body)
root.render(<Root />)
