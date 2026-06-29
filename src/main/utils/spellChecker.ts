// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

import { app, Session } from 'electron'

const initializedSessions = new WeakSet<Session>()
const repushedSessions = new WeakSet<Session>()

const resolveLanguages = (session: Session): string[] => {
  const availableLanguages = session.availableSpellCheckerLanguages
  const resolvedLanguages = new Set<string>()

  for (const lang of app.getPreferredSystemLanguages()) {
    if (availableLanguages.includes(lang)) {
      resolvedLanguages.add(lang)
      continue
    }
    const base = lang.split('-')[0]
    const match = availableLanguages.find(l => l === base || l.startsWith(`${base}-`))
    if (match != null) resolvedLanguages.add(match)
  }

  return [...resolvedLanguages]
}

export const setupSpellChecker = (session: Session): void => {
  if (initializedSessions.has(session))
    return
  initializedSessions.add(session)

  const languages = resolveLanguages(session)
  session.setSpellCheckerLanguages(languages)

  session.on('spellcheck-dictionary-initialized', () => {
    if (repushedSessions.has(session))
      return
    repushedSessions.add(session)
    session.setSpellCheckerLanguages([])
    session.setSpellCheckerLanguages(languages)
  })
}
