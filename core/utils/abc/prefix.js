const path = require("path");
const struct = require("ax-struct-js");
const { merge, each, isPlainObject, isString } = require("lodash");

const map = struct.map();
const isObj = struct.type('object');
const isArray = struct.type('array');
const keys = struct.keys();
const unique = struct.unique("fast");

const currentPath = process.cwd();
const defaultJSONPath = require("../../../config/defaultAbcJSON");

module.exports = function(abcJSON){
  // 创建一个默认的prefixAbcJSON
  let prefixAbcJSON = null;

  if (isPlainObject(abcJSON)) {
    prefixAbcJSON = abcJSON;
    // merge 默认的配置
    prefixAbcJSON = merge({}, defaultJSONPath, abcJSON);

    // 修正 define 输出给 webpack.DefinePlugin
    prefixAbcJSON.webpackDefine = map(prefixAbcJSON.define, function(defineProp) {
      if (isPlainObject(defineProp))
        each(defineProp, (val, globalName) => {
          if (isString(val)) defineProp[globalName] = JSON.stringify(val);
        });
      return defineProp;
    });

    // 修正alias 输出给 webpackConfig.alias
    prefixAbcJSON.webpackAlias = map(prefixAbcJSON.alias, function(aila) {
      return path.resolve(currentPath, aila);
    });

    //  自动注入historyApiFallback
    //  保证有rewirte
    if(prefixAbcJSON.devServer.historyApiFallback &&
      isObj(prefixAbcJSON.devServer.historyApiFallback) &&
      isArray(prefixAbcJSON.devServer.historyApiFallback.rewrites)
    ){
      const passRouter = c=>c.parsedUrl.pathname;
      let proxyList = keys(prefixAbcJSON.devServer.proxy) || [];

      if(prefixAbcJSON.mockServer &&
        (isString(prefixAbcJSON.mockServer.proxy) ||
          isArray(prefixAbcJSON.mockServer.proxy))){
        proxyList = unique(proxyList.concat(prefixAbcJSON.mockServer.proxy));
      }

      each(proxyList, function(key){
        prefixAbcJSON.devServer.historyApiFallback.rewrites.push({
          from: new RegExp(`^${key}/.*$`,),
          to: passRouter
        });
      });
    }

  }

  console.log(prefixAbcJSON.devServer.historyApiFallback.rewrites);

  return prefixAbcJSON;
};
