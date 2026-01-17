// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const path = require('path')
const ESLintPlugin = require("eslint-webpack-plugin")

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  isProduction,
  outputPath: path.resolve(__dirname, 'build'),
  baseConfig: {
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [{
        test: /\.(js|jsx|ts|tsx)$/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: 'babel-loader', // babel-loader uses polyfills (which ts-loader doesn't)
          },
        ],
      }],
    },
    devtool: isProduction ? undefined : 'inline-source-map',
    resolve: {
      roots: [path.resolve(__dirname)],
      extensions: ['.js', '.jsx', '.tsx', '.ts', '.scss'],
      modules: ['node_modules'],
    },
    plugins: [
      new ESLintPlugin({
        extensions: ['.ts', '.tsx'],
        files: ['src/']
      }),
    ],
  },
}
