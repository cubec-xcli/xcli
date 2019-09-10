process.env.NODE_ENV = "development";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const struct = require("ax-struct-js");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const AutoDLLPlugin = require('autodll-webpack-plugin');
const CircularDependencyPlugin = require("circular-dependency-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");
const noopServiceWorkerMiddleware = require("react-dev-utils/noopServiceWorkerMiddleware");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");

const threadLoader = require("thread-loader");
// for speed test
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();

module.exports = function(context, args) {
  const { prefixAbcJSON, paths, os, tools, std } = context.utils;
  const { mockServer } = context.servers;
  const { log } = std;
  const abcJSON = prefixAbcJSON;
  const { currentPath, currentOutputPath } = paths;
  const { ip, threads }= os;
  const port = +abcJSON.devServer.port;
  const listener = `http://${ip}:${port}`;

  const _cool = struct.cool();
  const _merge = struct.merge();
  const _extend = struct.extend();

  const existTypeScript = fs.existsSync(path.resolve(currentPath, "tsconfig.json"));
  const existReactHotLoader = fs.existsSync(path.resolve(currentPath + "node_modules/react-hot-loader"));
  const existReactHotDom = fs.existsSync(path.resolve(currentPath, "node_modules/@hot-loader/react-dom"));
  const cssModuleOptions = abcJSON.css ? ( abcJSON.css.module ? {
    mode: 'local',
    localIdentName: '[name]__[local]',
    // getLocalIdent: tools.system.optimizeCssModulesPlugin()
  } : false ): false;

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
    entry: [
      `${currentPath}/src/index.js`,
      require.resolve("webpack/hot/dev-server"),
      require.resolve("webpack-dev-server/client") +
      `?http://0.0.0.0:${port}/`
        // `?http://${ip}:${abcJSON.devServer.port}/`
    ],

    output: {
      // options related to how webpack emits results
      path: currentOutputPath,
      filename: "[name].js",
      chunkFilename: `[name].bundle.js`,
      publicPath: "/"
      // publicPath: `http://${ipadress}:${abcJSON.devServer.port}/`,
    },

    mode: "development",

    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: true,
      splitChunks: {
        cacheGroups: {
          // In dev mode, we want all vendor (node_modules) to go into a chunk,
          // so building main.js is faster.
          vendors: {
            chunks: "all",
            test: /[\\/]node_modules[\\/].*\.js/,
            name: "vendors",
            reuseExistingChunk: true,
            priority: 10,
            enforce: true
          }
        }
      }
    },

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
        // css modules
        {
          test: /\.module\.(css|s(a|c)ss)$/,
          use: [
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
            },
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
            },
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
          ]
        },
        // css&scss
        {
          test: /\.(css|s(a|c)ss)$/,
          exclude: /\.module\.(css|s(a|c)ss)$/,
          use: [
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
            },
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
                sourceMap: true,
                config: {
                  path: path.join(__dirname, "/")
                }
              }
            },
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
          ]
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

      new BundleAnalyzerPlugin({
        analyzerMode: "server",
        analyzerHost: "0.0.0.0", // ip
        analyzerPort: port + 1,
        reportFilename: "report.html",
        defaultSizes: "parsed",
        openAnalyzer: false,
        generateStatsFile: false,
        statsFilename: "stats.json",
        statsOptions: {
          exclude: ["xcli", "vendor"]
        },
        excludeAssets: ["xcli"],
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

      new HtmlWebpackPlugin({
        inject: true,
        filename: "index.html",
        template: `${currentPath}/src/index.html`
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

      new FriendlyErrorsWebpackPlugin()
    ].filter(_cool),

    devServer: _merge(
      {
        hot: true,
        quiet: true,
        disableHostCheck: true,
        https: false,
        // historyApiFallback: {
        //   rewrites: [
        //     {
        //       from: /^\/api\/.*$/,
        //       to: function(context) {
        //         return context.parsedUrl.pathname;
        //       }
        //     }
        //   ]
        // },
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
          // app.use(mockServer(abcJSON.mockServer));
        },

        after(app, serve){
          // setup mock server App
          app.use(mockServer(abcJSON.mockServer));
        }
      },
      abcJSON.devServer || {}
    ),

    //devtool: 'cheap-eval-source-map',
    devtool: "cheap-module-eval-source-map"
    //devtool: 'inline-cheap-source-map',
    //devtool: 'inline-cheap-module-source-map'
    //devtool: 'source-map'
  };

  const compiler = webpack(webpackConfig);
  const server = new webpackDevServer(compiler, webpackConfig.devServer);

  log(`Webpack DevServer Host on ${listener.red}`.green);

  return server.listen(port, "0.0.0.0", () => {
    log("------------------------------");
    log("Webpack DevServer Start!".green);
    tools.system.openBrowser(`${listener}`);
  });
};
