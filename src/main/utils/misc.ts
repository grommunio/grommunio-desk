// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

export function throwIfPropertyUndefined<T>(name: string, x: T | undefined): asserts x is T {
  if (x == null) throw new Error(`Property '${name}' is unexpectedly null`)
}
