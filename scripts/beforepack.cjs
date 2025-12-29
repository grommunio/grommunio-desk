// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const fs = require('fs')
const path = require('path')

exports.default = async function beforePack(context) {
  // debian packager (fpm) complains when the output directory doesn't exist
  // so we have to manually create it first
  const dir = path.join(context.outDir, context.packager.appInfo.version)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}
