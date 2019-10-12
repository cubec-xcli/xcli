const path = require("path");
const struct = require("ax-struct-js");
const { merge, each, isPlainObject, isString } = require("lodash");

const map = struct.map();
const isObj = struct.type('object');
const isArray = struct.type('array');
const keys = struct.keys();
const unique = struct.unique("fast");
const clone = struct.clone();

const currentPath = process.cwd();
const defaultJSONPath = require("../../../config/defaultAbcJSON");

const deepDefineResolve = function(env){
  const newDefine = map(env, (val, key)=>{
    if(
      val === "null" ||
      val === "undefined" ||
      val === "NaN" ||
      val === "Infinity" ||
      val === "void 0"
    ) return val;
    if(isString(val)) return env[key] = JSON.stringify(val);
    if(isPlainObject(val)) return deepDefineResolve(val);
    return val;
  });

  return newDefine;
};

module.exports = function(abcJSON){
  // 创建一个默认的prefixAbcJSON
  let prefixAbcJSON = null;

  if (isPlainObject(abcJSON)) {
    prefixAbcJSON = abcJSON;
    // merge 默认的配置
    prefixAbcJSON = merge({}, defaultJSONPath, abcJSON);

    // 修正 define 输出给 webpack.DefinePlugin
    // 是否存在namespace
    const existDefineNameSpace = prefixAbcJSON.defineNamespace && isString(prefixAbcJSON.defineNamespace);
    prefixAbcJSON.webpackDefine = map(clone(prefixAbcJSON.define), function(env) {
      if (isPlainObject(env)) env=deepDefineResolve(env);
      return existDefineNameSpace ? { [prefixAbcJSON.defineNamespace] : env } : env;
    });

    // 同时处理define
    prefixAbcJSON.define = map(prefixAbcJSON.define, function(env){
      let newEnv = env;
      if(isPlainObject(env))
        newEnv = existDefineNameSpace ? { [prefixAbcJSON.defineNamespace] : env } : env;
      return newEnv;
    });

    // console.log(prefixAbcJSON.define);
    // console.log(prefixAbcJSON.webpackDefine);
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

  return prefixAbcJSON;
};
