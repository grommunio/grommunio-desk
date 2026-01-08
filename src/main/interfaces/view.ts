// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

export default interface View<CreateOptions> {
  create(contentSize: number[], options: CreateOptions): void
  adjustBounds(contentSize: number[]): void
  reload?(options: CreateOptions): void
  close(): void
  toggleDevTools(): void
}
