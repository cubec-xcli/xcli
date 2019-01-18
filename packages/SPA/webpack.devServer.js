process.env.NODE_ENV = 'development';

const path = require('path');
const webpack = require('webpack');
const struct = require('ax-struct-js');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
//const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const AutoDLLPlugin = require('autodll-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const HappyPack = require('happypack');
const HappyThreadPool = HappyPack.ThreadPool({size: 8});
// for speed test
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();

const _merge = struct.merge();
const {abcJSON, paths} = require('../../lib/util');
const {currentPath, mockServer, ipadress} = paths;
const mockApp = require(mockServer);

module.exports = {
  entry: [
    `${currentPath}/src/index.js`,
    require.resolve('webpack/hot/dev-server'),
    require.resolve('webpack-dev-server/client') +
      `?http://${ipadress}:${abcJSON.devServer.port}/`,
  ],

  output: {
    // options related to how webpack emits results
    path: path.resolve(currentPath, abcJSON.path.output),
    filename: '[name].[hash:8].js',
    publicPath: "/",
    // publicPath: `http://${ipadress}:${abcJSON.devServer.port}/`,
  },

  mode: 'development',

  parallelism: 8,

  resolve: {
    alias: abcJSON.alias,
  },

  stats: 'minimal',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [require.resolve('happypack/loader') + '?id=jsx'],
      },
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: [require.resolve('happypack/loader') + '?id=sourcemap'],
      // },
      {
        test: /\.(ax|cubec)$/,
        exclude: /node_modules/,
        use: [require.resolve('happypack/loader') + '?id=cubec'],
      },
      {
        test: /\.(jpe?g|png|svg|gif)$/,
        exclude: /node_modules/,
        use: [require.resolve('happypack/loader') + '?id=image'],
      },
      {
        test: /\.(css|scss)$/,
        use: [
          require.resolve('css-hot-loader'),
          //MiniCssExtractPlugin.loader,
          require.resolve('happypack/loader') + '?id=scss',
        ],
      },
      // {
      //   test: /\.(otf|eot|svg|ttf|woff|woff2)$/,
      //   exclude: /(favicon\.png|favicon\.ico|node_modules)$/,
      //   use: [require.resolve('happypack/loader') + '?id=file'],
      // },
    ],
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new CaseSensitivePathsPlugin(),
    new webpack.ProvidePlugin(abcJSON.provide),
    new webpack.DefinePlugin({
      XISDEV: true,
      ...abcJSON.define,
    }),

    new webpack.LoaderOptionsPlugin({
      minimize: false,
      sourceMap: true,
      debug: true,
    }),

    new HappyPack({
      id: 'cubec',
      threadPool: HappyThreadPool,
      loaders: [
        {
          loader: require.resolve('cubec-loader'),
        },
      ],
    }),

    new HappyPack({
      id: 'image',
      threadPool: HappyThreadPool,
      loaders: [
        {
           loader: require.resolve('url-loader'),
           options: {
             limit: 8192
           }
        }
      ]
    }),

    // new HappyPack({
    //   id: 'sourcemap',
    //   threadPool: HappyThreadPool,
    //   loaders: [
    //     {
    //       loader: require.resolve('source-map-loader'),
    //       options: {
    //         sourceMap: true,
    //         enforce: "pre"
    //       },
    //     },
    //   ],
    // }),

    new HappyPack({
      id: 'jsx',
      threadPool: HappyThreadPool,
      loaders: [
        {
          loader: require.resolve('cache-loader'),
          options: {
            cacheDirectory: `${currentPath}/node_modules/.cache/cache-loader`
          }
        },
        {
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            sourceMap: true,
            presets: [
              require.resolve('@babel/preset-env'),
              require.resolve('@babel/preset-react'),
            ],
            plugins: [
              require.resolve('@babel/plugin-syntax-dynamic-import'),
              //require.resolve('@babel/plugin-transform-modules-commonjs'),
              //require.resolve('babel-plugin-add-module-exports'),
              require.resolve('@babel/plugin-proposal-object-rest-spread'),
              require.resolve('@babel/plugin-proposal-class-properties'),
              require.resolve('@babel/plugin-proposal-function-bind'),
            ],
            compact: true,
            cacheDirectory: true,
          },
        },
      ],
    }),

    // new HappyPack({
    //   id: 'file',
    //   threadPool: HappyThreadPool,
    //   loaders: [
    //     {
    //       loader: require.resolve('url-loader'),
    //       options: {
    //         limit: 1024
    //       }
    //     },
    //   ],
    // }),

    new HappyPack({
      id: 'scss',
      threadPool: HappyThreadPool,
      loaders: [
        {
          loader: require.resolve('style-loader'),
          options: {
            sourceMap: true,
          },
        },
        {
          loader: require.resolve('css-loader'),
          options: {
            sourceMap: true,
          },
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            sourceMap: 'inline',
            config: {
              path: path.join(__dirname, '/'),
            },
          },
        },
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: true,
          },
        },
        {
          loader: require.resolve('sass-loader'),
          options: {
            outputStyle: 'expanded',
            sourceMap: true,
          },
        },
      ],
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: ipadress,
      analyzerPort: abcJSON.devServer.port + 1,
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      openAnalyzer: false,
      generateStatsFile: false,
      statsFilename: 'stats.json',
      statsOptions: {
        exclude: ['xcli', 'vendor'],
      },
      excludeAssets: ['xcli'],
      logLevel: 'info',
    }),

    new HtmlWebpackPlugin({
      inject: true,
      filename: 'index.html',
      template: `${currentPath}/src/index.html`,
    }),

    // new AutoDLLPlugin({
    //   debug: false,
    //   inject: true,
    //   filename: '[name].dll.js',
    //   entry: {
    //     vendor: ['cubec'],
    //   },
    // }),

    // new MiniCssExtractPlugin({
    //   filename: '[name].css',
    //   chunkFilename: '[id].css',
    // }),

    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new webpack.HotModuleReplacementPlugin(),

    new DuplicatePackageCheckerPlugin(),

    new SimpleProgressWebpackPlugin(),

    new FriendlyErrorsWebpackPlugin(),
  ],

  devServer: _merge({
    hot: true,
    quiet: true,
    disableHostCheck: true,
    historyApiFallback: true,
    https: false,

    // clientLogLevel: 'none',
    // historyApiFallback: {
    //   disableDotRule: true,
    // },

    // if need HTML5 historyRouterAPI
    overlay: false,

    headers: {'Access-Control-Allow-Origin': '*'},

    // proxy: {
    //   [config.proxyUri]: {
    //     target: config.proxyTarget,
    //     target: 'http://192.168.1.227:5005/',
    //     target: 'http://192.168.1.30:5005/',
    //     target: 'http://localhost:5005',

    //     changeOrigin: true,
    //     pathRewrite: {[`^${config.proxyUri}`]: ''},

    //     bypass: (req, res, proxyOptions) => {
    //       if (req.headers.accept.indexOf('html') !== -1) {
    //         console.log('Skipping proxy for browser request.');
    //         return '/index.html';
    //       }
    //     },
    //   },
    // },

    before(app) {
      app.use(errorOverlayMiddleware());
      app.use(noopServiceWorkerMiddleware());
      // setup mock server App
      mockApp(app);
    },

  }, abcJSON.devServer),

  // devtool: 'cheap-module-eval-source-map',
  // devtool: 'inline-cheap-module-source-map',
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'cheap-module-eval-source-map',
};
