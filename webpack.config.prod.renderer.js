const {merge} = require('webpack-merge')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")

const base = require('./webpack.config.prod.base')

module.exports = merge(base,
  {
    entry: './src/renderer/mainWindow/index.tsx',
    target: 'electron-renderer',
    output: {
      path: __dirname + '/dist',
      filename: 'index.js',
    },
    devServer: {
      historyApiFallback: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/index.html',
      }),
      new MiniCssExtractPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
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
        new CssMinimizerPlugin(),
      ],
    },
  }
)