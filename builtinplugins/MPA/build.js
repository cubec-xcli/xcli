process.env.NODE_ENV = "production";

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const webpack = require("webpack");
const struct = require("ax-struct-js");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
//const PurifyCSSPlugin = require('purifycss-webpack');
//const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
//const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
//const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

const threadLoader = require("thread-loader");
// const HappyPack = require('happypack');
// const HappyThreadPool = HappyPack.ThreadPool({size: 8});

module.exports = function(context, args, callback) {
  const { prefixAbcJSON, paths, std, os, tools } = context.utils;
  const abcJSON = prefixAbcJSON;
  const { currentPath, currentOutputPath } = paths;
  const { log, info, error } = std;

  const regex = new RegExp(`${currentPath}`);
  const existTypeScript = fs.existsSync(path.resolve(currentPath, "tsconfig.json"));
  const existReactHotLoader = fs.existsSync(path.resolve(currentPath + "node_modules/react-hot-loader"));
  const cssModuleOptions = abcJSON.css ? ( abcJSON.css.module ? {
    mode: 'local',
    // localIdentName: '[name]__[local]',
    getLocalIdent: tools.system.optimizeCssModulesPlugin()
  } : false ): false;

  const _extend = struct.extend();
  const _cool = struct.cool();
  const _each = struct.each();
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

  const workerPoolScss = _extend(
    {
      name: "SCSS"
    },
    workerDefaultOptions
  );

  const workerPoolScssModule = _extend(
    {
      name: "SCSSMODULE"
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
  threadLoader.warmup(workerPoolScssModule, [
    require.resolve("cache-loader"),
    require.resolve("style-loader"),
    require.resolve("css-loader"),
    require.resolve("postcss-loader"),
    require.resolve("resolve-url-loader"),
    require.resolve("sass-loader")
  ]);
  threadLoader.warmup(workerPoolScss, [
    require.resolve("cache-loader"),
    require.resolve("style-loader"),
    require.resolve("css-loader"),
    require.resolve("postcss-loader"),
    require.resolve("resolve-url-loader"),
    require.resolve("sass-loader")
  ]);

  const webpackConfig = {
    entry: {},

    output: {
      // options related to how webpack emits results
      path: path.resolve(currentPath, abcJSON.path.output),
      filename: "[name]/[name].[contenthash:8].js",
      chunkFilename: `_vendors/${abcJSON.name}.[name].[contenthash:8].bundle.js`,
      publicPath: abcJSON.path.public || "/"
    },

    optimization: {
      concatenateModules: false,
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: "initial",
            name: "commons",
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 1
          },
          // In dev mode, we want all vendor (node_modules) to go into a chunk,
          // so building main.js is faster.
          vendors: {
            chunks: "all",
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            enforce: true
          }
        }
      }
    },

    mode: "production",

    parallelism: os.threads,

    resolve: {
      alias: abcJSON.webpackAlias,

      extensions: [ '.tsx', '.ts', '.js', '.jsx' ]
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
                  existTypeScript ? require.resolve("@babel/preset-typescript") : false,
                  require.resolve("@babel/preset-react")
                ].filter(_cool),
                plugins: [
                  require.resolve("@babel/plugin-syntax-dynamic-import"),
                  [require.resolve("@babel/plugin-proposal-object-rest-spread"),{ loose: true }],
                  require.resolve("@babel/plugin-proposal-class-properties"),
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
                    }
                  ]
                : [
                    {
                      loader: require.resolve("css-loader"),
                      options: {
                        sourceMap: false,
                        modules: cssModuleOptions,
                        importLoaders: 1
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
        },
        // css&scss
        {
          test: /\.(css|s(a|c)ss)$/,
          exclude: /\.module\.(css|s(a|c)ss)$/,
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
                        modules: false,
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
                        modules: false,
                        importLoaders: 1
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
      ]
    },

    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NamedChunksPlugin(function(chunk) {
        if (chunk.name) return chunk.name;
        for (let m of chunk._modules) {
          if (regex.test(m.context)) {
            if (m.issuer && m.issuer.id) {
              return path.basename(m.issuer.rawRequest);
            }

            return path.basename(m.rawRequest);
          }
        }
      }),

      // existTypeScript ? new ForkTsCheckerWebpackPlugin({
      //   // tsconfig: path.join(__dirname, "/tsconfig.json")
      //   silent: false,
      //   async: true
      // }) : false,

      // existTypeScript ? new ForkTsCheckerNotifierWebpackPlugin({
      //   excludeWarnings: true
      // }) : false,

      new CaseSensitivePathsPlugin(),
      new webpack.ProvidePlugin(abcJSON.provide),
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

      //new PrepackWebpackPlugin(),

      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /.css$/g,
        cssProcessor: require(require.resolve("clean-css")),
        cssProcessorPluginOptions: {},
        canPrint: true
      }),

      new MiniCssExtractPlugin({
        filename: "[name]/[name].[hash:8].css",
        chunkFilename: "[id].css"
      })

      // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],

    devServer: {
      quiet: true
    },

    devtool: false
  };

  let list = fs.readdirSync(`${currentPath}/src`);
  list = list.filter((val)=>(val[0] == "." ? false : val)).
              map((val)=>val);

  if (list.length) {
    _each(list, page => {
      const entryOutputDir = `${currentOutputPath}/${page}`;

      if (fs.existsSync(entryOutputDir)) {
        log(`webpack remove prevs exist [${page.red}] output directory - ${entryOutputDir.red}`);
        fse.removeSync(entryOutputDir);
      }

      webpackConfig.entry[page] = `${currentPath}/src/${page}/index.js`;

      webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
          inject: true,
          filename: `${page}/index.html`,
          template: `${currentPath}/src/${page}/index.html`,
          publicPath: abcJSON.path.public || "/",
          chunks: ["vendors", "commons", page],
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
        })
      );

    });

    webpackConfig.plugins = webpackConfig.plugins.concat([
      new webpack.DefinePlugin(abcJSON.webpackDefine[context.publishEntry] || abcJSON.webpackDefine.build || {}),
      new HtmlWebpackInlineSourcePlugin(),
      //new PurifyCSSPlugin(purifycssConfig),
      new WebpackBuildNotifierPlugin({
        title: `xcli Building [${abcJSON.name}]`,
        //logo: path.resolve("./img/favicon.png"),
        suppressSuccess: true
      }),
      new SimpleProgressWebpackPlugin(),
      new FriendlyErrorsWebpackPlugin()
    ]);

    const compiler = webpack(webpackConfig);

    return compiler.run(() => {
      info("webpack building completed!");
      if (_isFn(callback)) return callback(list);
      setTimeout(() => process.exit(), 3000);
    });
  }

  return error("must exist less than one entry for build!");
};
