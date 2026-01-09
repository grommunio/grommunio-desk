// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { TITLE_BAR } from '../../../constants/window'

const Root = (): React.ReactElement => {
  return (
    <div style={{
      color: TITLE_BAR.COLOR,
      backgroundColor: TITLE_BAR.BACKGROUND_COLOR,
      height: TITLE_BAR.HEIGHT,
    }}
    >
    </div>
  )
}

const root = createRoot(document.body)
root.render(<Root />)
