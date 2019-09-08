const path = require("path");
const struct = require("ax-struct-js");
const { merge, each, isPlainObject, isString } = require("lodash");

const map = struct.map();
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
  }

  return prefixAbcJSON;
};
