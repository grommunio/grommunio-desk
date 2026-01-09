// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

export default interface View<ViewOptions> {
  create(contentSize: number[], options: ViewOptions): void
  adjustBounds(contentSize: number[]): void
  reload?(options: ViewOptions): void
  close(): void
  toggleDevTools(): void
}
