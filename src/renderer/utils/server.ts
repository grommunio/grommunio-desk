// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

export function validateServerNameFormat(value: string): boolean {
  const NAME_REGEX_PATTERN = /^[a-z0-9-_ äöüß]*$/i
  const NAME_MAX_LENGTH = 20

  return NAME_REGEX_PATTERN.test(value) && value.length <= NAME_MAX_LENGTH
}

export function validateServerUrlFormat(value: string): boolean {
  const URL_REGEX_PATTERN = /^https:\/\/([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]+(:[0-9]+)?(\/[a-z0-9-]+)*\/?$/i

  return URL_REGEX_PATTERN.test(value)
}
