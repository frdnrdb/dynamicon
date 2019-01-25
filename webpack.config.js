const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

module.exports = (env, argv) => ({
  cache: false,
  entry: {
    dynamicon: ['babel-regenerator-runtime', __dirname + '/index.js'],
    demo: ['babel-regenerator-runtime', __dirname + '/src/style.css', __dirname + '/src/index.js']
  },
  output: {
    publicPath: ''
  },
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        exclude: /node_modules/,
        use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 2,
                    sourceMap: true
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    plugins: () => [
                        require('autoprefixer')
                    ],
                    sourceMap: true
                }
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true,
                    includePaths: [__dirname + '/src/scss']
                }
            }
        ]
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  },
  plugins: [
    new CleanWebpackPlugin([
      argv.mode === 'production' ? __dirname + '/dist' : '/temp'
    ]),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new MiniCssExtractPlugin()
  ],
  devtool: 'source-map'
});
