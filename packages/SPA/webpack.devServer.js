process.env.NODE_ENV = 'development';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const struct = require('ax-struct-js');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const AutoDLLPlugin = require('autodll-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');

const threadLoader = require("thread-loader");
// for speed test
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();

const {abcJSON, paths, os} = require('../../lib/util');
const mockServer = require("../../lib/mockserver");
const {currentPath, ipadress} = paths;
const _cool = struct.cool();
const _merge = struct.merge();
const _extend = struct.extend();

const workerDefaultOptions = {
  workers: os.threads - 1,
  workerParallelJobs: 50,
  poolRespawn: false,
  poolTimeout: Infinity,
  poolParallelJobs: 400
};

const workerPoolJSX = _extend(
  {
    name: "JSX"
  },
  workerDefaultOptions
);

const workerPoolCubec = _extend(
  {
    name: "CUBEC"
  },
  workerDefaultOptions
);

const workerPoolScss = _extend(
  {
    name: "SCSS"
  },
  workerDefaultOptions
);

threadLoader.warmup(workerPoolJSX, [
  require.resolve("cache-loader"),
  require.resolve("babel-loader"),
  require.resolve("@babel/preset-env"),
  require.resolve("@babel/preset-react")
]);
threadLoader.warmup(workerPoolCubec, [
  require.resolve("cache-loader"),
  require.resolve("cubec-loader")
]);
threadLoader.warmup(workerPoolScss, [
  require.resolve("cache-loader"),
  require.resolve("style-loader"),
  require.resolve("css-loader"),
  require.resolve("postcss-loader"),
  require.resolve("resolve-url-loader"),
  require.resolve("sass-loader"),
]);

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
    chunkFilename: `[name].[contenthash:8].bundle.js`,
    publicPath: "/",
    // publicPath: `http://${ipadress}:${abcJSON.devServer.port}/`,
  },

  mode: 'development',

  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: true,
    splitChunks: {
      cacheGroups: {
        // In dev mode, we want all vendor (node_modules) to go into a chunk,
        // so building main.js is faster.
        vendors: {
          chunks: 'all',
          test: /[\\/]node_modules[\\/].*\.js/,
          name: 'vendors',
          reuseExistingChunk: true,
          priority: 10,
          enforce: true,
        },
      },
    },
  },

  parallelism: os.threads,

  resolve: {
    alias: abcJSON.alias,
  },

  stats: 'minimal',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("thread-loader"),
            options: workerPoolJSX
          },
          {
            loader: require.resolve("cache-loader"),
            options: {
              cacheDirectory: `${currentPath}/node_modules/.cache/cache-loader`
            }
          },
          {
            loader: require.resolve("babel-loader"),
            options: {
              babelrc: false,
              sourceMap: true,
              presets: [
                require.resolve("@babel/preset-env"),
                require.resolve("@babel/preset-react")
              ],
              plugins: [
                require.resolve("@babel/plugin-syntax-dynamic-import"),
                [
                  require.resolve("@babel/plugin-proposal-object-rest-spread"),
                  { loose: true }
                ],
                require.resolve("@babel/plugin-proposal-class-properties"),
                require.resolve("@babel/plugin-proposal-function-bind"),
                fs.existsSync(paths.currentPath+"/node_modules/react-hot-loader") ?
                  "react-hot-loader/babel" :
                  false,
              ].filter(_cool),
              compact: true,
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.(ax|cubec)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("thread-loader"),
            options: workerPoolCubec
          },
          {
            loader: require.resolve("cache-loader"),
            options: {
              cacheDirectory: `${currentPath}/node_modules/.cache/cache-loader`
            }
          },
          {
            loader: require.resolve("cubec-loader")
          }
        ]
      },
      {
        test: /\.(?:ico|proto|png|gif|mp4|m4a|mp3|jpg|svg|ttf|otf|eot|woff|woff2)$/,
        use: [
          {
            loader: require.resolve("file-loader"),
            options: {
              name: "[name].[ext]",
              emitFile: true
            }
          }
        ]
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: require.resolve('css-hot-loader'),
          },
          // MiniCssExtractPlugin.loader,
          {
            loader: require.resolve("thread-loader"),
            options: workerPoolScss
          },
          {
            loader: require.resolve("cache-loader"),
            options: {
              cacheDirectory: `${currentPath}/node_modules/.cache/cache-loader`
            }
          },
        ].concat(abcJSON.wap
          ? [
              {
                loader: require.resolve("style-loader")
              },
              {
                loader: require.resolve("css-loader"),
                options: {
                  sourceMap: true,
                  modules: abcJSON.css ? !!abcJSON.css.modules : false,
                  importLoaders: 2
                }
              },
              {
                loader: require.resolve("postcss-loader"),
                options: {
                  sourceMap: "inline",
                  config: {
                    path: path.join(__dirname, "/")
                  }
                }
              }
            ]
          : [
              {
                loader: require.resolve("style-loader")
              },
              {
                loader: require.resolve("css-loader"),
                options: {
                  sourceMap: true,
                  modules: abcJSON.css ? !!abcJSON.css.modules : false,
                  importLoaders: 2
                }
              }
            ]
        ).concat([
          {
            loader: require.resolve("resolve-url-loader"),
            options: {
              sourceMap: true
            }
          },
          {
            loader: require.resolve("sass-loader"),
            options: {
              sourceMap: true
            }
          }
        ])
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

    new webpack.LoaderOptionsPlugin({
      minimize: false,
      sourceMap: true,
      debug: true,
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

    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),

    new HtmlWebpackPlugin({
      inject: true,
      filename: 'index.html',
      template: `${currentPath}/src/index.html`,
    }),

    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // new webpack.SourceMapDevToolPlugin({
    //   filename: '[name].js.map',
    //   exclude: ['vendor']
    // }),

    new webpack.HotModuleReplacementPlugin(),

    new DuplicatePackageCheckerPlugin(),

    new WebpackBuildNotifierPlugin({
      title: `xcli devServer boot [${abcJSON.name}]`,
      //logo: path.resolve("./img/favicon.png"),
      suppressSuccess: true
    }),

    new SimpleProgressWebpackPlugin(),

    new FriendlyErrorsWebpackPlugin(),
  ],

  devServer: _merge({
    hot: true,
    quiet: true,
    disableHostCheck: true,
    historyApiFallback: true,
    https: false,
    //lazy: true,

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
      //app.use(mockServer(abcJSON.mockServer));
    },

    after(app, serve){
      // setup mock server App
      app.use(mockServer(abcJSON.mockServer));
    }

  }, abcJSON.devServer || {}),

  //devtool: 'cheap-eval-source-map',
  devtool: 'cheap-module-eval-source-map',
  //devtool: 'inline-cheap-source-map',
  //devtool: 'inline-cheap-module-source-map'
  //devtool: 'source-map'
};
