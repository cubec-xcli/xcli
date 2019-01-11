process.env.NODE_ENV = 'development';

const fs = require('fs');
const path = require('path');
const opn = require('opn');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const inquirer = require('inquirer');
const struct = require('ax-struct-js');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const AutoDLLPlugin = require('autodll-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const HappyPack = require('happypack');
const HappyThreadPool = HappyPack.ThreadPool({size: 8});
// for speed test
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();

const {abcJSON, paths} = require('../../lib/util');
const {currentPath, mockServer, ipadress} = paths;
const regex = new RegExp(`${currentPath}`);
const mockApp = require(mockServer);

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
    path: path.resolve(currentPath, abcJSON.path.output),
    filename: '[name]/[name].[hash:8].js',
    chunkFilename: '_vendors/[name].bundle.js',
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
        test: /\.(css|scss)$/,
        use: [
          require.resolve('css-hot-loader'),
          MiniCssExtractPlugin.loader,
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
      loaders: (abcJSON.wap ? [
        {
          loader: require.resolve('css-loader'),
          options: {
            sourceMap: true,
            importLoaders: 1
          },
        },
        { 
          loader: require.resolve('postcss-loader'),
          options: {
            sourceMap: true,
            config: {
              path: path.join(__dirname,"/")
            }
          }
        },
      ] : [
        {
          loader: require.resolve('css-loader'),
          options: {
            sourceMap: true
          },
        },
      ]).concat([
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: true,
          },
        },
        {
          loader: require.resolve('sass-loader'),
          options: {
            sourceMap: true,
          },
        }
      ]),
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
        exclude: ['xcli', 'vendor', 'webpack','hot'],
      },
      excludeAssets: ['xcli,webpack','hot'],
      logLevel: 'info',
    }),

    // new HtmlWebpackPlugin({
    //   inject: true,
    //   filename: 'index.html',
    //   template: `${currentPath}/src/index.html`,
    // }),

    // new AutoDLLPlugin({
    //   debug: false,
    //   inject: true,
    //   filename: '[name].dll.js',
    //   entry: {
    //     vendor: ['cubec'],
    //   },
    // }),

    new MiniCssExtractPlugin({
      filename: '[name]/[name].css',
      chunkFilename: '[id].css',
    }),

    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new webpack.HotModuleReplacementPlugin(),

    new DuplicatePackageCheckerPlugin(),

    new SimpleProgressWebpackPlugin(),

    new FriendlyErrorsWebpackPlugin(),
  ],

  devServer: {
    hot: true,
    quiet: true,
    disableHostCheck: true,
    // historyApiFallback: true,
    https: abcJSON.devServer.https || false,

    // clientLogLevel: 'none',
    // historyApiFallback: {
    //   disableDotRule: true,
    // },

    // if need HTML5 historyRouterAPI
    overlay: false,

    headers: {'Access-Control-Allow-Origin': '*'},

    proxy: abcJSON.devServer.proxy,
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
  },

  // devtool: 'cheap-module-eval-source-map',
  // devtool: 'inline-cheap-module-source-map',
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'cheap-module-eval-source-map',
};

module.exports = function(util) {
  const _each = struct.each();

  const {log, error} = util.msg;
  let list = fs.readdirSync(`${currentPath}/src`);
  list = list.filter(function(val){ return val[0] == "." ? false : val });

  return inquirer
    .prompt([
      {
        type: 'checkbox',
        name: 'entry',
        message: 'Choice the project entry for development',
        choices: list,
      },
    ])
    .then(({entry}) => {
      if (entry.length) {

        _each(entry, page => {
          webpackConfig.entry[page] = [
            `${currentPath}/src/${page}/index.js`,
            require.resolve('webpack/hot/dev-server'),
            require.resolve('webpack-dev-server/client') +
              `?http://0.0.0.0:${abcJSON.devServer.port}/`,
          ];

          webpackConfig.plugins.push(
            new HtmlWebpackPlugin({
              inject: true,
              filename: `${page}/index.html`,
              template: `${currentPath}/src/${page}/index.html`,
              chunks: [page],
            }),
          );
        });

        const compiler = webpack(webpackConfig);
        const server = new webpackDevServer(compiler, webpackConfig.devServer);
        const port = +abcJSON.devServer.port || 9001;
        const entryOpen = entry[0];

        log(`Webpack DevServer Host on ${`${ipadress}:${port}`.red}`.green);

        return server.listen(port, "0.0.0.0", () => {
          log('------------------------------');
          log('Webpack DevServer Start!'.green);

          opn(
            `${
              abcJSON.devServer.https ? 'https' : 'http'
            }://${ipadress}:${port}/${entryOpen}`,
            {
              app: ['google chrome', '--incognito'],
            },
          );
        });
      } else {
        return error('must choice less than one entry for devServer!');
      }
    });
};
