const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main/resources/static/js/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'src/main/resources/public'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/main/resources/static/index.html',
      filename: 'index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: './src/main/resources/static/css', 
          to: 'css',
          noErrorOnMissing: true
        },
        { 
          from: './src/main/resources/static/images', 
          to: 'images',
          noErrorOnMissing: true
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.js']
  },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'src/main/resources/public'),
    },
    compress: true,
    port: 8081,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        logLevel: 'info'
      }
    ]
  }
};
