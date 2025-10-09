const ESLintPlugin = require("eslint-webpack-plugin")

module.exports = {
  mode: 'development',
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
  devtool: 'inline-source-map',
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
}
