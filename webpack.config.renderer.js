const {merge} = require('webpack-merge');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const base = require('./webpack.config.base');

module.exports = merge(base,
  {
    entry: './src/app.tsx',
    target: 'electron-renderer',
    output: {
      path: __dirname + '/dist',
      filename: 'app.js',
      //publicPath: './',
      //libraryTarget: 'umd' // Fix: "Uncaught ReferenceError: exports is not defined".
    },
    devServer: {
      historyApiFallback: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
    ],
    //node: { global: true }, // Fix: "Uncaught ReferenceError: global is not defined", and "Can't resolve 'fs'".
  }
);