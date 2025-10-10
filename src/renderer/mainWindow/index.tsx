import React from 'react'
import { createRoot } from 'react-dom/client'
import * as styles from './index.module.css'

const Root = () => {
  return (
    <div className={styles.text}>
      Hello world!
    </div>
  )
}

const root = createRoot(document.body)
root.render(<Root />)
