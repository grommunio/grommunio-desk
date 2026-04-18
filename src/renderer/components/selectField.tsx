// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useState, useEffect } from 'react'

import styles from './selectField.module.css'
import componentStyles from './component.module.css'
import { SelectFieldOption } from '../../types/selectField'

interface Props<T> {
  options: SelectFieldOption<T>[]
  placeholder?: string
  placeholderOption?: SelectFieldOption<T>
  onChange?: (value: T) => void
}

// TODO: use consistently function syntax instead of arrow systax
// TODO: scroll when using arrow keys
// TODO: auto scroll to the last selected value
function SelectField<T>(props: Props<T>): React.ReactElement {
  const [isOpen, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectFieldOption<T> | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  useEffect(() => {
    if (props.placeholderOption != null) {
      setSelectedOption(props.placeholderOption)
      setHighlightedIndex(props.options.findIndex(val => val === props.placeholderOption))
    }
  }, [props.placeholderOption, props.options])

  const handleOptionClick = (option: SelectFieldOption<T>): void => {
    setSelectedOption(option)
    setOpen(false)
    props.onChange?.(option.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!isOpen && e.key === 'Enter') {
      setOpen(true)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex(prev => prev < props.options.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        handleOptionClick(props.options[highlightedIndex])
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div
      className={styles.field}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`${componentStyles.component} ${styles.display} ${selectedOption ? styles.selected : ''}`}
        onClick={() => setOpen(prev => !prev)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
      >
        {selectedOption ? selectedOption.label : props.placeholder}
        <span className={styles.arrow} />
      </div>
      {
        isOpen && (
          <ul className={styles.dropdown}>
            {
              props.options.map((option, index) => (
                <li
                  key={index}
                  className={`${styles.option} ${index === highlightedIndex ? styles.highlighted : ''}`}
                  onMouseMove={() => setHighlightedIndex(index)}
                  onMouseDown={e => e.preventDefault()} // prevent focus change
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                </li>
              ))
            }
          </ul>
        )
      }
    </div>
  )
}

export default SelectField
