process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const struct = require('ax-struct-js');
//const glob = require('glob');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
//const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
//const PurifyCSSPlugin = require('purifycss-webpack');
//const CleanWebpackPlugin = require('clean-after-emit-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
//const CircularDependencyPlugin = require('circular-dependency-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const threadLoader = require("thread-loader");

const {abcJSON, paths, os} = require('../../lib/util');
const {currentPath,ipadress} = paths;
const _extend = struct.extend();
const _cool = struct.cool();

const workerDefaultOptions = {
  workers: os.threads - 1,
  workerParallelJobs: 50,
  poolRespawn: true,
  poolTimeout: 2000,
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
  entry: `${currentPath}/src/index.js`,

  output: {
    // options related to how webpack emits results
    path: path.resolve(currentPath, abcJSON.path.output),
    filename: '[name].[hash:8].js',
    chunkFilename: `[name].[contenthash:8].bundle.js`,
    publicPath: abcJSON.path.public || "/",
  },

  mode: 'production',

  parallelism: os.threads,

  resolve: {
    alias: abcJSON.alias,
  },

  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0,
        },
        // In dev mode, we want all vendor (node_modules) to go into a chunk,
        // so building main.js is faster.
        vendors: {
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          reuseExistingChunk: true,
          priority: 10,
          enforce: true,
        },

        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },

  // stats: 'minimal',

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
              presets: [
                [
                  require.resolve("@babel/preset-env"),
                  {
                    targets: {
                      chrome: 38,
                      browsers: [
                        "last 2 versions",
                        "safari 7",
                        "android >= 4.4",
                        "ie > 10"
                      ]
                    },
                    modules: false,
                    useBuiltIns: false,
                    debug: false
                  }
                ],
                require.resolve("@babel/preset-react")
              ],
              plugins: [
                fs.existsSync(paths.currentPath+"/node_modules/react-hot-loader") ?
                  "react-hot-loader/babel" :
                  false,
                require.resolve("@babel/plugin-syntax-dynamic-import"),
                [
                  require.resolve("@babel/plugin-proposal-object-rest-spread"),
                  { loose: true }
                ],
                require.resolve("@babel/plugin-proposal-class-properties"),
                require.resolve("@babel/plugin-proposal-function-bind")
              ].filter(_cool),
              babelrc: false,
              compact: true,
              sourceMap: false,
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
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve("thread-loader"),
            options: workerPoolScss
          },
          {
            loader: require.resolve("cache-loader"),
            options: {
              cacheDirectory: `${currentPath}/node_modules/.cache/cache-loader`
            }
          }
        ]
          .concat(
            abcJSON.wap
              ? [
                  {
                    loader: require.resolve("css-loader"),
                    options: {
                      sourceMap: false,
                      modules: abcJSON.css ? !!abcJSON.css.modules : false,
                      importLoaders: 2
                    }
                  },
                  {
                    loader: require.resolve("postcss-loader"),
                    options: {
                      sourceMap: false,
                      config: {
                        path: path.join(__dirname, "/")
                      }
                    }
                  }
                ]
              : [
                  {
                    loader: require.resolve("css-loader"),
                    options: {
                      sourceMap: false,
                      modules: abcJSON.css ? !!abcJSON.css.modules : false
                    }
                  }
                ]
          )
          .concat([
            {
              loader: require.resolve("resolve-url-loader"),
              options: {
                sourceMap: false
              }
            },
            {
              loader: require.resolve("sass-loader"),
              options: {
                sourceMap: false
              }
            }
          ])
      }
    ],
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new CaseSensitivePathsPlugin(),
    new webpack.ProvidePlugin(abcJSON.provide),
    new webpack.DefinePlugin({
      XISDEV: false,
      ...abcJSON.define,
    }),

    new webpack.LoaderOptionsPlugin({
      minimize: true,
      sourceMap: false,
      debug: false,
    }),

    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new BabelMinifyPlugin(
      {
        booleans: true,
        builtIns: true,
        consecutiveAdds: true,
        deadcode: true,
        evaluate: true,
        flipComparisons: true,
        guards: true,
        infinity: true,
        mangle: true,
        memberExpressions: true,
        mergeVars: true,
        numericLiterals: true,
        propertyLiterals: true,
        regexpConstructors: true,
        removeConsole: false, // not removeConsole
        removeDebugger: true,
        removeUndefined: true,
        replace: true,
        simplify: true,
        simplifyComparisons: true,
        typeConstructors: true,
        undefinedToVoid: true,
      },
      {
        comments: false,
      },
    ),

    //new PrepackWebpackPlugin(),

    new UglifyJSPlugin({
      test: /.(js|jsx)$/,
      exclude: /node_modules/,
      cache: true,
      parallel: true,
      sourceMap: false,

      uglifyOptions: {
        ie8: false,
        output: {
          comments: false,
          beautify: false,
        },
        compress: {
          unsafe: false,
          hoist_vars: true,
          drop_console: false,
          drop_debugger: true,
        },
        sourceMap: false,
      },
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `${currentPath}/src/index.html`,
      publicPath: abcJSON.path.public || "/",
      inlineSource: '.css$',
      chunksSortMode: 'dependency',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeStyleLinkTypeAttributes: true,
        removeRedundantAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        removeTagWhitespace: true,
        useShortDoctype: true,
        keepClosingSlash: true,
        minifyURLs: true,
        minifyCSS: true,
      },
    }),

    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /.css$/g,
      cssProcessor: require(require.resolve('clean-css')),
      cssProcessorPluginOptions: {},
      canPrint: true,
    }),

    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css',
      chunkFilename: '[id].[hash:8].css',
    }),

    // new HardSourceWebpackPlugin({
    //   // Either an absolute path or relative to webpack's options.context.
    //   cacheDirectory: path.resolve(
    //     currentPath,
    //     'node_modules/.cache/hard-source/[confighash]',
    //   ),
    //   // Either false, a string, an object, or a project hashing function.
    //   environmentHash: {
    //     root: currentPath,
    //     files: ['package-lock.json', 'yarn.lock'],
    //   },
    //   // An object.
    //   info: {
    //     // 'none' or 'test'.
    //     mode: 'none',
    //     // 'debug', 'log', 'info', 'warn', or 'error'.
    //     level: 'debug',
    //   },
    //   // Clean up large, old caches automatically.
    //   cachePrune: {
    //     // Caches younger than `maxAge` are not considered for deletion. They must
    //     // be at least this (default: 2 days) old in milliseconds.
    //     maxAge: 2 * 24 * 60 * 60 * 1000,
    //     // All caches together must be larger than `sizeThreshold` before any
    //     // caches will be deleted. Together they must be at least this
    //     // (default: 50 MB) big in bytes.
    //     sizeThreshold: 50 * 1024 * 1024,
    //   },
    // }),
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'server',
    //   analyzerHost: ipadress,
    //   analyzerPort: abcJSON.devServer.port + 1,
    //   reportFilename: 'report.html',
    //   defaultSizes: 'parsed',
    //   openAnalyzer: false,
    //   generateStatsFile: false,
    //   statsFilename: 'stats.json',
    //   statsOptions: {
    //     exclude: ['xcli', 'vendor'],
    //   },
    //   excludeAssets: ['xcli'],
    //   logLevel: 'info',
    // }),

    new HtmlWebpackInlineSourcePlugin(),

    //new PurifyCSSPlugin(purifycssConfig),
    new WebpackBuildNotifierPlugin({
      title: `xcli Building [${abcJSON.name}]`,
      //logo: path.resolve("./img/favicon.png"),
      suppressSuccess: true
    }),

    new SimpleProgressWebpackPlugin(),

    new FriendlyErrorsWebpackPlugin(),

    // new CleanWebpackPlugin({
    //   paths: [path.resolve(currentPath, abcJSON.path.output)+"/*.css"]
    // })
  ],

  devServer: {
    quiet: true,
  },

  devtool: false,
};
