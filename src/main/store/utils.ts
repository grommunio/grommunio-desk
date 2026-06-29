// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

interface NodeSystemError extends Error {
  code: string
  errno: number
}
export function isSystemError(error: unknown): error is NodeSystemError {
  return error instanceof Error && 'code' in error && 'errno' in error
}
