// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

import React from 'react'
import { createRoot } from 'react-dom/client'
import * as styles from './index.module.css'

const Root = (): React.ReactElement => {
  return (
    <div className={styles.text}>
      Hello world!
    </div>
  )
}

const root = createRoot(document.body)
root.render(<Root />)
