const common = require("./webpack.common.js")
const merge = require("webpack-merge")
var path = require('path');


module.exports = merge(common, {
  mode: "development",
  output: {
    filename: '[name].js',
    globalObject: 'this',
    // path: __dirname + "/dist",
    // publicPath: '/dist/',
  },
  module: {
    rules: [
       // {
     //   test: /\.css$/,
     //   use: [
     //     'vue-style-loader',
     //     // 'resolve-url-loader',
     //     'css-loader'
     //   ]
     // },
      {
      test: /\.s[ac]ss$/i,
      exclude: /node_modules/,
      use: [
        // Creates `style` nodes from JS strings
        'vue-style-loader',
        // Translates CSS into CommonJS
        'css-loader',
        // "postcss-loader",
        'resolve-url-loader',
        // Compiles Sass to CSS
        'sass-loader',
      ],
    }, ],
  },
});
