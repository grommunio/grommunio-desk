const {merge} = require('webpack-merge')

const base = require('./webpack.config.prod.base')

module.exports = merge(base,
  {
    entry: './src/electron.ts',
    target: 'electron-main',
    output: {
      path: __dirname + '/dist',
      filename: 'electron.js',
    },
  }
)