// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const {merge} = require('webpack-merge')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")

const {baseConfig, isProduction, outputPath} = require('./webpack.config.base')

module.exports = merge(baseConfig,
  {
    entry: {
      main: './src/renderer/mainWindow/index.tsx',
    },
    target: 'electron-renderer',
    output: {
      path: outputPath,
      filename: 'renderer_[name].bundle.js',
      //publicPath: './',
      //libraryTarget: 'umd' // Fix: "Uncaught ReferenceError: exports is not defined".
    },
    devServer: {
      historyApiFallback: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/index.html',
      }),
      isProduction && new MiniCssExtractPlugin(),
    ],
    //node: { global: true }, // Fix: "Uncaught ReferenceError: global is not defined", and "Can't resolve 'fs'".
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            isProduction ? {loader: MiniCssExtractPlugin.loader} : {loader: 'style-loader'},
            {
              loader: 'css-loader',
              options: {
                modules: true,
              },
            }
          ],
        },
      ],
    },
    optimization: {
      minimizer: [
          isProduction && new CssMinimizerPlugin(),
      ],
    },
  }
)