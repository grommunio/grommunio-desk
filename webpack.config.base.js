// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const ESLintPlugin = require("eslint-webpack-plugin")

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  isProduction,
  outputPath: __dirname + '/build',
  baseConfig: {
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [{
        test: /\.(js|jsx|ts|tsx)$/,
        include: /src/,
        use: [
          {
            loader: 'babel-loader', // babel-loader uses polyfills (which ts-loader doesn't)
          },
        ],
      }],
    },
    devtool: isProduction ? undefined : 'inline-source-map',
    resolve: {
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
