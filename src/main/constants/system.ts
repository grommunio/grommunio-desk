// Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

export const systemPlatform = process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'
