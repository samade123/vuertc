const NpmInstallPlugin = require("npm-install-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
var path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');



var ImageminPlugin = require('imagemin-webpack-plugin').default
var WebpackBuildNotifierPlugin = require('webpack-build-notifier');
var WebpackNotifierPlugin = require('webpack-notifier');
var nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');




module.exports = {
  entry: {
    main: './src/js/app.js',
  },
  // target: 'node', // in order to ignore built-in modules like path, fs, etc.
  // externals: [nodeExternals({
  //         // this WILL include `jquery` and `webpack/hot/dev-server` in the bundle, as well as `lodash/*`
  //         whitelist: ['vue-pdf',/\.(?!(?:jsx?|json)$).{1,5}$/i]
  //     })],
  plugins: [
    // new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: "./src/index.html",
      minify: false,
    }),
    new MiniCssExtractPlugin(),
    // new CleanWebpackPlugin(),
    new ImageminPlugin({
      disable: process.env.NODE_ENV !== 'production', // Disable during development
      pngquant: {
        quality: '95-100'
      }
    }),
    new WebpackNotifierPlugin(),
    new VueLoaderPlugin(),
    function() { // post css plugins, can be exported to postcss.config.js
      return [
        require('precss'),
        require('autoprefixer')
      ];
    },
    new CopyWebpackPlugin([{
      from: 'src/fonts',
      to: 'fonts',
      toType: 'dir'
    }]),
    new CopyWebpackPlugin([{
      from: 'src/images',
      to: 'site/images',
      toType: 'dir'
    }]),
    // new CopyWebpackPlugin([{
    //   from: 'server.js',
    //   to: '.',
    //   toType: 'dir'
    // }]),
    // new NpmInstallPlugin()
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min.js'
    }
  },
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          babelrc: false,
          presets: [
            ["es2015", {
              modules: false
            }], "stage-3"
          ],
        }
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          // 'resolve-url-loader',
          'css-loader'
        ]
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader'
        }
      },
      // {
      //   test: /\.(png|svg|jpg|gif)$/i,
      //   exclude: /node_modules/,
      //   use: [{
      //     loader: 'file-loader',
      //     options: {
      //       name: '[path][name].[ext]',
      //     },
      //   }, ],
      // },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
            publicPath: './fonts/'
          }
        }]
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif|pdf)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.(svg)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
};
