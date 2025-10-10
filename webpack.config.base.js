// Copyright (c) 2020-present grommunio GmbH. All Rights Reserved.

const ESLintPlugin = require("eslint-webpack-plugin")

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  isProduction,
  baseConfig: {
    mode: isProduction? 'production' : 'development',
    module: {
      rules: [{
        test: /\.ts(x?)$/,
        include: /src/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              projectReferences: true
            }
          }
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
