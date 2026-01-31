// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

export function throwIfPropertyUndefined<T>(name: string, x: T | undefined): asserts x is T {
  if (x == null) throw new Error(`Property '${name}' is unexpectedly null`)
}
