// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import React, { useState, useEffect, useRef } from 'react'

import styles from './selectField.module.css'
import componentStyles from './component.module.css'
import { SelectFieldOption } from '../../types/selectField'

interface Props<T> {
  className?: string
  options: SelectFieldOption<T>[]
  placeholder?: string
  placeholderOption?: SelectFieldOption<T>
  onChange: (value: T) => void
}

// TODO: use consistently function syntax instead of arrow systax
function SelectField<T>(props: Props<T>): React.ReactElement {
  const [isOpen, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectFieldOption<T> | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const selectDisplayRef = useRef<HTMLDivElement>(null)
  const selectOptionsRef = useRef<Record<number, HTMLLIElement | null>>({})

  useEffect(() => {
    if (props.placeholderOption != null) {
      setSelectedOption(props.placeholderOption)
      setHighlightedIndex(props.options.findIndex(val => val === props.placeholderOption))
      props.onChange(props.placeholderOption.value)
    }
  }, [])

  const handleOptionClick = (option: SelectFieldOption<T>, inputType: 'keyboard' | 'mouse'): void => {
    setSelectedOption(option)
    props.onChange(option.value)
    setOpen(false)
    if (inputType === 'mouse')
      selectDisplayRef.current?.blur()
  }

  useEffect(() => {
    if (isOpen && selectedOption != null) {
      const index = props.options.indexOf(selectedOption)
      setHighlightedIndex(index)
      selectOptionsRef.current[index]?.scrollIntoView({ block: 'center' })
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    e.stopPropagation()
    if (!isOpen && e.key === 'Enter') {
      setOpen(true)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) => {
          const next = prev < props.options.length - 1 ? prev + 1 : prev
          selectOptionsRef.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
        break
      case 'ArrowUp':
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : prev
          selectOptionsRef.current[next]?.scrollIntoView({ block: 'nearest' })
          return next
        })
        break
      case 'Enter':
        handleOptionClick(props.options[highlightedIndex], 'keyboard')
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div
      className={`${styles.field} ${props.className != null ? props.className : ''}`}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`${componentStyles.component} ${styles.display} ${selectedOption ? styles.selected : ''}`}
        onClick={() => setOpen(prev => !prev)}
        onBlur={() => setOpen(false)}
        ref={selectDisplayRef}
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
                  onClick={() => handleOptionClick(option, 'mouse')}
                  ref={(ref) => { selectOptionsRef.current[index] = ref }}
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
