const {merge} = require('webpack-merge')

const {baseConfig} = require('./webpack.config.base')

module.exports = merge(baseConfig,
  {
    entry: './src/electron.ts',
    target: 'electron-main',
    output: {
      path: __dirname + '/dist',
      filename: 'electron.js',
    },
  }
)