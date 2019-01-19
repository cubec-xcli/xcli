const {abcJSON} = require("../../lib/util");
const postcss_preset = require(require.resolve("postcss-preset-env"))({
  browsers: ['last 2 versions', 'iOS >= 6', "Android >= 4.3", "not ie <= 10"]
});
const postcss_clean = require(require.resolve("postcss-clean"))({ level: 2 });
const postcss_momentum_scrolling = require(require.resolve("postcss-momentum-scrolling"));
const postcss_no_important = require(require.resolve('postcss-no-important'))({});
//const postcss_uncss= require(require.resolve("postcss-uncss"))({ html: ['*.html','**/*.html']});

const postcss_production_plugins = process.env.NODE_ENV !== "production" ? [] : 
(abcJSON.wap ? [
  postcss_preset,
  postcss_clean,
  postcss_momentum_scrolling,
  postcss_no_important,
  //postcss_uncss,
  require(require.resolve("postcss-pxtorem"))({
    rootValue: 37.5,
    unitPrecision: 5,
    propList: ['*','!border*'],
    selectorBlackList: [],
    replace: true,
    mediaQuery: false,
    minPixelValue: 1
  })
] : [
  postcss_preset,
  postcss_clean,
  postcss_momentum_scrolling,
  postcss_no_important,
  //postcss_uncss
]);

module.exports = {
  ident: 'postcss',
  syntax: require.resolve('postcss-scss'),
  plugins: postcss_production_plugins,
};
