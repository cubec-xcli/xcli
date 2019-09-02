process.env.NODE_ENV = 'production';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const struct = require('ax-struct-js');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
//const PurifyCSSPlugin = require('purifycss-webpack');
//const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
//const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
//const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const threadLoader = require("thread-loader");
// const HappyPack = require('happypack');
// const HappyThreadPool = HappyPack.ThreadPool({size: 8});

const {abcJSON, paths, msg, os} = require('../../lib/util');
const {currentPath} = paths;
const regex = new RegExp(`${currentPath}`);
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
    alias: abcJSON.alias
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
          } else {
            return path.basename(m.rawRequest);
          }
        }
      }
    }),

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

const build = function(entry, pubkey, callback) {
  const _each = struct.each();
  const _isFn = struct.type('func');
  const {log, error} = msg;
  const output = `${currentPath}/${abcJSON.path.output}`;
  // const purifycssConfig = {
  //   paths: glob.sync(`${currentPath}/{*,!(node_modules|${abcJSON.path.output})/}**/*.+(html|cubec|js)`),
  //   styleExtensions: ['.css', '.scss'],
  //   minimize: true,
  //   moduleExtensions: ['.cubec', '.html', '.js','.jsx']
  // }

  if (entry.length) {
    _each(entry, page => {
      const entryOutputDir = `${output}/${page}`;

      if (fs.existsSync(entryOutputDir)) {
        log(
          `webpack remove prevs exist [${page.red}] output directory - ${
            entryOutputDir.red
          }`,
        );
        fse.removeSync(entryOutputDir);
      }

      webpackConfig.entry[page] = `${currentPath}/src/${page}/index.js`;

      // purifycssConfig.paths[page] =
      // glob.sync(`${currentPath}/{*,!(node_modules|${abcJSON.path.output})/}**/*.+(html|cubec|js)`);
      //console.log(purifycssConfig.paths[page]);

      webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
          inject: true,
          filename: `${page}/index.html`,
          template: `${currentPath}/src/${page}/index.html`,
          publicPath: abcJSON.path.public || "/",
          chunks: ['vendors', 'commons', page],
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
      );
    });

    const defined = abcJSON.define[pubkey] || abcJSON.define.build || {};

    webpackConfig.plugins = webpackConfig.plugins.concat([
      new webpack.DefinePlugin(defined),
      new HtmlWebpackInlineSourcePlugin(),
      //new PurifyCSSPlugin(purifycssConfig),
      new WebpackBuildNotifierPlugin({
        title: `xcli Building [${abcJSON.name}]`,
        //logo: path.resolve("./img/favicon.png"),
        suppressSuccess: true
      }),
      new SimpleProgressWebpackPlugin(),
      new FriendlyErrorsWebpackPlugin(),
    ]);

    const compiler = webpack(webpackConfig);
    compiler.run(() => {
      log('webpack building completed!');
      if(_isFn(callback)) return callback(entry);
      setTimeout(()=>process.exit(), 2000);
    });
  } else {
    return error('must choice less than one entry for build!');
  }
};

module.exports = function(entrys, pubkey, callback) {
  if(typeof entrys === 'function'){
    callback = entrys;
    pubkey = null;
    entrys = null;
  }

  if (entrys)
    return build(entrys, pubkey, callback);

  let list = fs.readdirSync(`${currentPath}/src`);
  list = list.filter(function(val) {
    return val[0] == '.' ? false : val;
  }).map(function(val){
    // return {name:val, value:val};
    return val;
  });

  // return new MultiSelect({
  //   name: 'value',
  //   message: 'Choice the project entry for development',
  //   choices: list,
  // }).run().then((entrys)=>{
  //   return build(entrys, callback);
  // });

  return build(list, pubkey, callback);
};
