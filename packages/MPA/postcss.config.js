//console.log(process.env.NODE_ENV);
const {abcJSON} = require("../../lib/util");

const postcss_preset = require(require.resolve("postcss-preset-env"))({
  browsers: ['last 2 versions', 'iOS >= 6', "Android >= 4.4", "not ie <= 10"]
});

const postcss_production_plugins = process.env.NODE_ENV !== "production" ? [] : 
(abcJSON.wap ? [
  postcss_preset,
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
  postcss_preset
]);

module.exports = {
  ident: 'postcss',
  syntax: require.resolve('postcss-scss'),
  plugins: [
    require(require.resolve("postcss-import"))({}),
    require(require.resolve('postcss-no-important'))({}),
  ].concat(postcss_production_plugins),
};
