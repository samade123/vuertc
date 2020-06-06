var path = require('path');
const common = require("./webpack.common.js")
const merge = require("webpack-merge")
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');





module.exports = merge(common, {
  mode: "production",
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]-[contentHash].css'
    }),
    new CleanWebpackPlugin(),

    // new NpmInstallPlugin()
  ],
  optimization: {
    minimizer: [new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.optimize\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', {
          discardComments: {
            removeAll: true
          }
        }],
      },
      canPrint: true
    }), new TerserPlugin, ],
  },
  output: {
    filename: '[name]-[contentHash].js'
  },
  module: {
    rules: [{
      test: /\.s[ac]ss$/i,
      exclude: /node_modules/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader'
      ]
    }, ],
  },
});
