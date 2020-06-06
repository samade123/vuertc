const dev = require("./webpack.dev.js")
const merge = require("webpack-merge")
var path = require('path');
const webpack = require('webpack')

const HOST = 'localhost'
const PORT = 8081

module.exports = merge(dev, {
  // devtool: false,
  devServer: {
    clientLogLevel: 'warning',
    hot: true,
    writeToDisk: true,
    // hotOnly: true,
    contentBase: 'dist',
    compress: true,
    host: HOST,
    port: PORT,
    open: true,
    overlay: { warnings: false, errors: true },
    publicPath: '/',
    quiet: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin(),
    // new webpack.SourceMapDevToolPlugin({})
],
  // module: {
  //   rules: [
  //     {
  //       test: /\.js/,
  //       use: ['vue-hot-reload-loader'],
  //       // If and only if all your components are in `path/to/components` directory
  //       // include: path.resolve(__dirname, 'path/to/components')
  //     }
  //   ]
  // }

});
