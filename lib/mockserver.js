const fs = require('fs');
const colors = require('colors');
const struct = require('ax-struct-js');
const { paths, msg } = require('./util');

const { mockServer } = paths;
const { log, warn, error } = msg;

const _keys = struct.keys();
const _each = struct.each("array");
const _trim = struct.string("trim");
const _slice = struct.slice();
const _combined = struct.combined();
const _isFn = struct.type("func");
const _isObj = struct.type("object");
const _paramParse = struct.param("parse");
const _merge = struct.merge();

const pathReg = /\/:([^\s/]+)/g;
const regmapsReg = '/([^\\s\\/]+)';
const asyncHandler = fn => (req, res, next, param, query) => 
  Promise.resolve(fn(req, res, next, param, query)).catch(next);

// 生成规则
function generateMaps(routes = {}){
  const STORE_RULES = {
    GET: {},
    POST: {},
    DELETE: {},
    PUT: {},
    UPDATE: {}
  };

  const STORE_MATCH = {
    GET: {},
    POST: {},
    DELETE: {},
    PUT: {},
    UPDATE: {}
  };

  const STORE_PARAMS = {
    GET: {},
    POST: {},
    DELETE: {},
    PUT: {},
    UPDATE: {}
  };

  const paths = _keys(routes);

  _each(paths, function(path){
    // GET=>/a/v/c/:d
    let parsePath = path.replace(/[\s\n\f]/g,'').split("=>");
    let getMethod = parsePath[0];
    let getPath = parsePath[1];

    if(!STORE_RULES[getMethod])
      return warn(`[mock server] not support request method [${getMethod.bold}] : ${getPath.bold}`.yellow);

    STORE_RULES[getMethod][getPath] = routes[path]; 
    STORE_PARAMS[getMethod][getPath] = [];
    STORE_MATCH[getMethod][getPath] = RegExp('^' + _trim(getPath).replace(pathReg, function(match, param){
      STORE_PARAMS[getMethod][getPath].push(param);
      return regmapsReg;
    }) + '[/]?$');
  });

  return {
    rules: STORE_RULES,    // 规则映射回调
    params: STORE_PARAMS,  // 动态参数
    match: STORE_MATCH     // 匹配正则
  };
}

module.exports = function(config = {}) {
  const selfConfig = _merge({ 
    debug: false,
  }, config);

  var rules = generateMaps(require(mockServer));

  // 原生NODE探测文件的更改动态更新rules
  fs.watch(mockServer, { recursive: true }, (type, filename)=>{
    try{
      delete require.cache[require.resolve(mockServer)];
      delete require.cache[require.resolve(mockServer+"/"+filename)];
      rules = generateMaps(require(mockServer));
    }catch(e){
      error("[mock server] live update source mockfile script throw unexcept error".red);
    }
  });

  // 生成中间件
  return function(req, res, next){
    let url = req.originalUrl;
    let requestType = req.method;
    let requestPath = url.split("#")[0].split("?")[0];

    let route;
    let param;
    let query = _paramParse(url);

    let matchKeys = _keys(rules.match[requestType]);
    for (let i = 0, l = matchKeys.length, checker; i < l; i++)
      if ((checker = rules.match[requestType][matchKeys[i]]).test(requestPath)) {
        route = matchKeys[i];
        param = _combined(rules.params[route], _slice(checker.exec(requestPath), 1));
        break;
      }

    if(route){
      if(selfConfig.debug) log(`${"[mock server]".bold} routed => ${route.green.bold}`);
      
      try{
        let action = rules.rules[requestType][route];

        if(_isFn(action)){
          return (asyncHandler(action))(req, res, next, param, query);
        }else if(action && _isObj(action)){
          res.json(action);
        }else{
          error(`[mock server] not defined action event with path matcher => ${route.bold}`.red);
        }
      }catch(e){
        error(`[mock server] exec action error on dispatch the route => ${route.bold}`.red);
      }

    }

    return next();
  };
};
