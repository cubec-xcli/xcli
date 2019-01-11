module.exports = {
  plugins: [
    require(require.resolve("autoprefixer"))({
      browsers: ['last 2 versions', 'iOS >= 6', "Android >= 4.4", "not ie <= 10"]
    }),
    require(require.resolve("postcss-preset-env"))({}),
    require(require.resolve("postcss-pxtorem"))({
      rootValue: 37.5,
      unitPrecision: 5,
      propList: ['*','!border*'],
      selectorBlackList: [],
      replace: true,
      mediaQuery: false,
      minPixelValue: 1
    })
  ],
};
