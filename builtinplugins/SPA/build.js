process.env.NODE_ENV = "production";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const struct = require("ax-struct-js");
//const glob = require('glob');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
//const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
//const PurifyCSSPlugin = require('purifycss-webpack');
//const CleanWebpackPlugin = require('clean-after-emit-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
//const CircularDependencyPlugin = require('circular-dependency-plugin')
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const threadLoader = require("thread-loader");

module.exports = function(context, args, callback) {
  const { prefixAbcJSON, paths, os, tools, std } = context.utils;
  const { info } = std;
  const abcJSON = prefixAbcJSON;
  const { currentPath } = paths;
  const { threads }= os;

  const existTypeScript = fs.existsSync(path.resolve(currentPath, "tsconfig.json"));
  const existReactHotLoader = fs.existsSync(path.resolve(currentPath + "node_modules/react-hot-loader"));
  const cssModuleOptions = abcJSON.css ? ( abcJSON.css.module ? {
    mode: 'local',
    // localIdentName: '[name]__[local]',
    getLocalIdent: tools.system.optimizeCssModulesPlugin()
  } : false ): false;

  const _extend = struct.extend();
  const _cool = struct.cool();
  const _isFn = struct.type("func");

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

  // const workerPoolScss = _extend(
  //   {
  //     name: "SCSS"
  //   },
  //   workerDefaultOptions
  // );
  //
  const workerPoolPug = _extend(
    {
      name: "PUG"
    },
    workerDefaultOptions
  );

  threadLoader.warmup(workerPoolJSX, [
    require.resolve("cache-loader"),
    require.resolve("babel-loader"),
    require.resolve("@babel/preset-env"),
    existTypeScript ? require.resolve("@babel/preset-typescript") : false,
    require.resolve("@babel/preset-react")
  ].filter(_cool));
  threadLoader.warmup(workerPoolCubec, [
    require.resolve("cache-loader"),
    require.resolve("cubec-loader")
  ]);
  threadLoader.warmup(workerPoolPug, [
    require.resolve("cache-loader"),
    require.resolve("pug-loader")
  ]);
  // threadLoader.warmup(workerPoolScss, [
  //   require.resolve("cache-loader"),
  //   require.resolve("style-loader"),
  //   require.resolve("css-loader"),
  //   require.resolve("postcss-loader"),
  //   require.resolve("resolve-url-loader"),
  //   require.resolve("sass-loader")
  // ]);

  const webpackConfig = {
    entry: `${currentPath}/src/index.js`,

    output: {
      // options related to how webpack emits results
      path: path.resolve(currentPath, abcJSON.path.output),
      filename: "[name].[hash:8].js",
      chunkFilename: `[name].[contenthash:8].bundle.js`,
      publicPath: abcJSON.path.public || "/"
    },

    mode: "production",

    parallelism: threads,

    resolve: {
      alias: abcJSON.webpackAlias,

      extensions: [ '.tsx', '.ts', '.js', '.jsx' ]
    },

    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: true,
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: "initial",
            name: "commons",
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0
          },
          // In dev mode, we want all vendor (node_modules) to go into a chunk,
          // so building main.js is faster.
          vendors: {
            chunks: "all",
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            reuseExistingChunk: true,
            priority: 10,
            enforce: true
          },

          styles: {
            name: "styles",
            test: /\.css$/,
            chunks: "all",
            enforce: true
          }
        }
      }
    },

    // stats: 'minimal',

    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
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
                  require.resolve("@babel/preset-react"),
                  existTypeScript ? require.resolve("@babel/preset-typescript") : false,
                ].filter(_cool),
                plugins: [
                  [require.resolve("@babel/plugin-transform-runtime"), { helpers: false, regenerator: true }],
                  require.resolve("@babel/plugin-syntax-dynamic-import"),
                  [require.resolve("@babel/plugin-proposal-object-rest-spread"), { loose: true }],
                  [require.resolve("@babel/plugin-proposal-class-properties"), { loose: true }],
                  require.resolve("@babel/plugin-proposal-function-bind"),
                  existReactHotLoader ? "react-hot-loader/babel" : false,
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
          test: /\.(pug|jade)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve("thread-loader"),
              options: workerPoolPug
            },
            {
              loader: require.resolve("cache-loader"),
              options: {
                cacheDirectory: `${currentPath}/node_modules/.cache/cache-loader`
              }
            },
            {
              loader: require.resolve("pug-loader")
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
        // css modules
        {
          test: /\.module\.(css|s(a|c)ss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve("css-loader"),
              options: {
                sourceMap: false,
                modules: cssModuleOptions,
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
            },
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
          ]
        },
        // css&scss
        {
          test: /\.(css|s(a|c)ss)$/,
          exclude: /\.module\.(css|s(a|c)ss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve("css-loader"),
              options: {
                sourceMap: false,
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
            },
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
          ]
        }
      ]
    },

    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
      new CaseSensitivePathsPlugin(),
      new webpack.ProvidePlugin(abcJSON.provide),
      new webpack.DefinePlugin(abcJSON.webpackDefine.build || {}),

      new webpack.LoaderOptionsPlugin({
        minimize: true,
        sourceMap: false,
        debug: false
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
          undefinedToVoid: true
        },
        {
          comments: false
        }
      ),

      //new PrepackWebpackPlugin(),

      new UglifyJSPlugin({
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        cache: true,
        parallel: true,
        sourceMap: false,

        uglifyOptions: {
          ie8: false,
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            unsafe: false,
            hoist_vars: true,
            drop_console: false,
            drop_debugger: true
          },
          sourceMap: false
        }
      }),

      new HtmlWebpackPlugin({
        filename: "index.html",
        template: `${currentPath}/src/index.pug`,
        templateParameters: abcJSON.define[context.publishEntry] || abcJSON.define.build || {},
        publicPath: abcJSON.path.public || "/",
        inlineSource: ".css$",
        chunksSortMode: "dependency",
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
          minifyCSS: true
        }
      }),

      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /.css$/g,
        cssProcessor: require(require.resolve("clean-css")),
        cssProcessorPluginOptions: {},
        canPrint: true
      }),

      new MiniCssExtractPlugin({
        filename: "[name].[hash:8].css",
        chunkFilename: "[name].[contenthash:8].css"
      }),

      abcJSON.css.embed ? new HtmlWebpackInlineSourcePlugin() : false,

      //new PurifyCSSPlugin(purifycssConfig),
      new WebpackBuildNotifierPlugin({
        title: `xcli Building [${abcJSON.name}]`,
        //logo: path.resolve("./img/favicon.png"),
        suppressSuccess: true
      }),

      new SimpleProgressWebpackPlugin(),

      new FriendlyErrorsWebpackPlugin()
    ].filter(_cool),

    devServer: {
      quiet: true
    },

    devtool: false
  };

  const compiler = webpack(webpackConfig);

  return compiler.run(() => {
    info("webpack building completed!");
    if (_isFn(callback)) return callback();
    setTimeout(() => process.exit(), 3000);
  });
};
