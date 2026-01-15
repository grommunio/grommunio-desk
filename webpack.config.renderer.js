// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const {merge} = require('webpack-merge')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")

const {baseConfig, isProduction, outputPath} = require('./webpack.config.base')

module.exports = merge(baseConfig,
  {
    entry: {
      'main-main': './src/renderer/mainWindow/mainView/index.tsx',
      'main-titleBar': './src/renderer/mainWindow/titleBar/index.tsx',
    },
    target: 'electron-renderer',
    output: {
      path: outputPath,
      filename: 'renderer_[name].bundle.js',
    },
    devServer: {
      historyApiFallback: true,
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'grommunio Desk',
        filename: 'main-main.html',
        template: './src/index.html',
        chunks: ['main-main'],
        inject: true,
      }),
      new HtmlWebpackPlugin({
        title: 'grommunio Desk',
        filename: 'main-titleBar.html',
        template: './src/index.html',
        chunks: ['main-titleBar'],
        inject: true,
      }),
      isProduction && new MiniCssExtractPlugin(),
    ],
    target: 'web',
    resolve: {
      alias: {
        '@utils': '/src/renderer/utils/',
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            isProduction ? {loader: MiniCssExtractPlugin.loader} : {loader: 'style-loader'},
            {
              loader: 'css-loader',
              options: {
                modules: {
                  namedExport: false,
                },
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
