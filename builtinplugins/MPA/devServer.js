process.env.NODE_ENV = "development";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const struct = require("ax-struct-js");
const { MultiSelect } = require("enquirer");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const AutoDLLPlugin = require('autodll-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const CircularDependencyPlugin = require("circular-dependency-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");
const noopServiceWorkerMiddleware = require("react-dev-utils/noopServiceWorkerMiddleware");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");

const threadLoader = require("thread-loader");
// const HappyPack = require("happypack");
// const HappyThreadPool = HappyPack.ThreadPool({ size: 8 });

// for speed test
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();

module.exports = function(context, args) {
  const { paths, std, os, prefixAbcJSON, packageJSON, cache, tools } = context.utils;
  const { log, error } = std;
  const { currentPath, currentOutputPath } = paths;
  const { ip, threads } = os;
  const { mockServer } = context.servers;
  const isRestart = args[1];  // [isDebugMode, isRestart];

  const abcJSON = prefixAbcJSON;
  const listener = `http://${ip}:${abcJSON.devServer.port}`;
  const existTypeScript = fs.existsSync(path.resolve(currentPath, "tsconfig.json"));
  const existReactHotLoader = fs.existsSync(path.resolve(currentPath + "node_modules/react-hot-loader"));
  const existReactHotDom = fs.existsSync(path.resolve(currentPath, "node_modules/@hot-loader/react-dom"));
  const cssModuleOptions = abcJSON.css ? ( abcJSON.css.module ? {
    mode: 'local',
    localIdentName: '[name]__[local]',
    // getLocalIdent: tools.system.optimizeCssModulesPlugin()
  } : false ): false;

  const _each = struct.each();
  const _merge = struct.merge();
  const _extend = struct.extend();
  const _cool = struct.cool();

  const workerDefaultOptions = {
    workers: threads - 1,
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
    existTypeScript ? require.resolve("@babel/preset-typescript") : false,
    require.resolve("@babel/preset-react")
  ].filter(_cool));
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
    require.resolve("sass-loader")
  ]);

  const webpackConfig = {
    // entry: [
    //   `${currentPath}/src/index.js`,
    //   require.resolve('webpack/hot/dev-server'),
    //   require.resolve('webpack-dev-server/client') +
    //     `?http://${ipadress}:${abcJSON.devServer.port}/`,
    // ],
    entry: {},

    output: {
      // options related to how webpack emits results
      path: currentOutputPath,
      filename: "[name]/[name].js",
      chunkFilename: `_vendors/[name].bundle.js`,
      publicPath: "/"
    },

    mode: "development",

    parallelism: threads,

    resolve: {
      alias: _extend(
        abcJSON.webpackAlias,
        existReactHotDom ? { "react-dom": "@hot-loader/react-dom" } : {}
      ),

      extensions: [ '.tsx', '.ts', '.js', '.jsx' ]
    },

    stats: "minimal",

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
                babelrc: false,
                sourceMap: true,
                presets: [
                  require.resolve("@babel/preset-env"),
                  existTypeScript ? require.resolve("@babel/preset-typescript") : false,
                  require.resolve("@babel/preset-react")
                ].filter(_cool),
                plugins: [
                  require.resolve("@babel/plugin-syntax-dynamic-import"),
                  [require.resolve("@babel/plugin-proposal-object-rest-spread"),{ loose: true }],
                  require.resolve("@babel/plugin-proposal-class-properties"),
                  require.resolve("@babel/plugin-proposal-function-bind"),
                  existReactHotLoader ? "react-hot-loader/babel" : false
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
        // css module
        {
          test: /\.module\.(css|s(a|c)ss)$/,
          use: [
            // MiniCssExtractPlugin.loader,
            {
              loader: require.resolve("css-hot-loader")
            },
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
                      loader: require.resolve("style-loader")
                    },
                    {
                      loader: require.resolve("css-loader"),
                      options: {
                        sourceMap: true,
                        modules: cssModuleOptions,
                        importLoaders: 2
                      }
                    },
                    {
                      loader: require.resolve("postcss-loader"),
                      options: {
                        sourceMap: true,
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
                        modules: cssModuleOptions,
                        camelCase: true,
                        importLoaders: 1
                      }
                    }
                  ]
            )
            .concat([
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

        // css&scss
        {
          test: /\.(css|s(a|c)ss)$/,
          exclude: /\.module\.(css|s(a|c)ss)$/,
          use: [
            {
              loader: require.resolve("css-hot-loader")
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
            }
          ]
            .concat(
              abcJSON.wap
                ? [
                    {
                      loader: require.resolve("style-loader")
                    },
                    {
                      loader: require.resolve("css-loader"),
                      options: {
                        sourceMap: true,
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
                        importLoaders: 1
                      }
                    }
                  ]
            )
            .concat([
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
        }
      ]
    },

    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
      new CaseSensitivePathsPlugin(),
      new webpack.ProvidePlugin(abcJSON.provide),
      new webpack.DefinePlugin(abcJSON.webpackDefine.dev || {}),

      new webpack.LoaderOptionsPlugin({
        minimize: false,
        sourceMap: true,
        debug: true
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
        analyzerMode: "server",
        analyzerHost: '0.0.0.0',
        analyzerPort: abcJSON.devServer.port + 1,
        reportFilename: "report.html",
        defaultSizes: "parsed",
        openAnalyzer: false,
        generateStatsFile: false,
        statsFilename: "stats.json",
        statsOptions: {
          exclude: ["xcli", "vendor", "webpack", "hot"]
        },
        excludeAssets: ["xcli,webpack", "hot"],
        logLevel: "info"
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
        cwd: process.cwd()
      }),

      existTypeScript ? new ForkTsCheckerWebpackPlugin({
        // tsconfig: path.join(__dirname, "/tsconfig.json")
        silent: false,
        async: true
      }) : false,

      existTypeScript ? new ForkTsCheckerNotifierWebpackPlugin({
        excludeWarnings: true
      }) : false,

      // new MiniCssExtractPlugin({
      //   filename: '[name]/[name].css',
      //   chunkFilename: '[id].css',
      // }),

      // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      new webpack.HotModuleReplacementPlugin(),

      new DuplicatePackageCheckerPlugin(),

      new WebpackBuildNotifierPlugin({
        title: `xcli devServer boot [${abcJSON.name}]`,
        //logo: path.resolve("./img/favicon.png"),
        suppressSuccess: true
      }),

      new SimpleProgressWebpackPlugin(),

      new FriendlyErrorsWebpackPlugin()
    ].filter(_cool),

    devServer: _merge(
      {
        hot: true,
        quiet: true,
        disableHostCheck: true,
        historyApiFallback: {
          rewrites: [
            {
              from: /^\/api\/.*$/,
              to: function(context) {
                return context.parsedUrl.pathname;
              }
            }
          ]
        },
        https: false,
        //lazy: true,

        // clientLogLevel: 'none',
        // historyApiFallback: {
        //   disableDotRule: true,
        // },

        // if need HTML5 historyRouterAPI
        overlay: false,

        headers: { "Access-Control-Allow-Origin": "*" },

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

        after(app, serve) {
          // setup mock server App
          app.use(mockServer(abcJSON.mockServer));
        }
      },
      abcJSON.devServer || {}
    ),

    // devtool: 'cheap-module-eval-source-map',
    // devtool: 'inline-cheap-module-source-map',
    // devtool: 'cheap-module-eval-source-map',
    devtool: "cheap-module-eval-source-map"
  };

  // 执行devServer
  const devServer = function(entry){
    if (entry.length) {
      cache.set("preEntry", entry);

      _each(entry, page => {
        webpackConfig.entry[page] = [
          `${currentPath}/src/${page}/index.js`,
          require.resolve("webpack/hot/dev-server"),
          require.resolve("webpack-dev-server/client") +
          `?http://0.0.0.0:${abcJSON.devServer.port}/`
        ];

        webpackConfig.plugins.push(
          new HtmlWebpackPlugin({
            inject: true,
            filename: `${page}/index.html`,
            template: `${currentPath}/src/${page}/index.html`,
            chunks: [page]
          })
        );
      });

      const port = +abcJSON.devServer.port;
      const compiler = webpack(webpackConfig);
      const server = new webpackDevServer(compiler, webpackConfig.devServer);
      const entryOpen = entry[0];

      log(`Webpack DevServer Host on ${listener.red}`.green);

      return server.listen(port, "0.0.0.0", () => {
        log("------------------------------");
        log("Webpack DevServer Start!".green);

        tools.system.openBrowser(`${listener}/${entryOpen}`);
      });
    }

    return error("must choice less than one entry for devServer!");
  };

  if(isRestart) return devServer(cache.get("preEntry"));

  // 扫描目录
  let list = fs.readdirSync(`${currentPath}/src`);
  list = list.filter((val)=>(val[0] == "." ? false : val)).
              map((val)=>({ name: val, value: val }));

  return new MultiSelect({
    name: "value",
    message: "Choice the project entry for development",
    choices: list
  }).
    run().
    then(devServer).
    catch(error);
};
