process.env.NODE_ENV = 'production';

const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HappyPack = require('happypack');
const HappyThreadPool = HappyPack.ThreadPool({size: 8});

const {abcJSON, paths} = require('../../lib/util');
const {currentPath} = paths;

module.exports = {
  entry: `${currentPath}/src/index.js`,

  output: {
    // options related to how webpack emits results
    path: path.resolve(currentPath, abcJSON.path.output),
    filename: '[name].[hash:8].js',
    publicPath: '/',
  },

  mode: 'production',

  resolve: {
    alias: abcJSON.alias,
  },

  // stats: 'minimal',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [require.resolve('happypack/loader') + '?id=jsx'],
      },
      {
        test: /\.(ax|cubec)$/,
        exclude: /node_modules/,
        use: [require.resolve('happypack/loader') + '?id=cubec'],
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          require.resolve('happypack/loader') + '?id=scss',
        ],
      },
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

    new HappyPack({
      id: 'cubec',
      threadPool: HappyThreadPool,
      loaders: [
        {
          loader: require.resolve('ax-loader'),
        },
      ],
    }),

    new HappyPack({
      id: 'jsx',
      threadPool: HappyThreadPool,
      loaders: [
        {
          loader: require.resolve('cache-loader'),
        },
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require.resolve('@babel/preset-env'),
              require.resolve('@babel/preset-react'),
            ],
            plugins: [
              require.resolve('@babel/plugin-proposal-class-properties'),
              require.resolve('@babel/plugin-proposal-function-bind'),
            ],
            babelrc: false,
            compact: true,
            sourceMap: false,
            cacheDirectory: true,
          },
        },
      ],
    }),

    new HappyPack({
      id: 'scss',
      threadPool: HappyThreadPool,
      loaders: [
        {
          loader: require.resolve('css-loader'),
          options: {
            sourceComments: false,
            sourceMap: false,
          },
        },
        {
          loader: require.resolve('clean-css-loader'),
          options: {
            level: 2,
            sourceMap: false,
          },
        },
        {
          loader: require.resolve('sass-loader'),
          options: {
            sourceMap: false,
          },
        },
      ],
    }),

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
          unsafe: true,
          warnings: false,
          hoist_vars: true,
          drop_console: true,
        },
        sourceMap: false,
      },
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `${currentPath}/src/index.html`,
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
      cssProcessor: require(require.resolve('cssnano')),
      cssProcessorPluginOptions: {
        //preset: ['default', {discardComments: {removeAll: true}}],
        preset: ['advanced', {discardComments: {removeAll: true}}],
      },
      canPrint: true,
    }),

    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css',
      chunkFilename: '[id].css',
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

    new HtmlWebpackInlineSourcePlugin(),

    new SimpleProgressWebpackPlugin(),

    new FriendlyErrorsWebpackPlugin(),
  ],

  devServer: {
    quiet: true,
  },

  devtool: false,
};
