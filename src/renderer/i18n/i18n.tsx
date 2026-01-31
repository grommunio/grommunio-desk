// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import { FALLBACK_LNG } from '../../constants/i18n' // TODO: add webpack path resolving, e.g. import ... from '@constants/...'
import translationEnglish from './en.json'
import translationGerman from './de.json'

const resources = {
  en: {
    translation: translationEnglish,
  },
  de: {
    translation: translationGerman,
  },
}

const getSystemLanguage = (): string => {
  if (typeof navigator !== 'undefined')
    return navigator.language.replace(/-\w*/, '')
  return FALLBACK_LNG
}

i18next.use(initReactI18next).init({
  resources,
  lng: getSystemLanguage(),
  fallbackLng: FALLBACK_LNG,
  debug: process.env.NODE_ENV !== 'production', // TODO: improve: add function to warn when translation to key is missing
})

export default i18next
