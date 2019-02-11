// 后期需要用红黑树对匹配路径进行优化
const fs = require('fs');
const colors = require('colors');
const struct = require('ax-struct-js');
const { paths, msg } = require('./util');

const { mockServer } = paths;
const { log, warn, error } = msg;

const _keys = struct.keys();
const _each = struct.each("array");
const _trim = struct.string("trim");
const _combined = struct.combined();
const _isFn = struct.type("func");
const _isObj = struct.type("object");
const _paramParse = struct.param("parse");
const _merge = struct.merge();
const _size = struct.size();

const asyncHandler = fn => (req, res, next, param, query) =>
  Promise.resolve(fn(req, res, next, param, query)).catch(next);

// 生成规则
function generateMapTree(routes = {}, config){
  const result = {
    maping: {
      GET:{},
      POST:{},
      PUT:{},
      UPDATE: {},
      DELETE: {}
    },
    tree: {},
    origin: {},
    need: [],
  };

  _each(result.need = _keys(routes), function(routeRule){
    const routeParse = routeRule.split("=>");
    const mapingMethod = _trim(routeParse[0]);

    if(!result.maping[mapingMethod]){
      if(config.debug) error("[mock server] can't match route rule as unkown request method => "+routeRule.red);
    }

    // 创建映射规则
    // /a
    // /a/:/c
    // /a/b/:
    const mapingRouteParam = [];
    let mapingRouteKey = _trim(routeParse[1].replace(/:([^\/]+)/g,function(match){
      mapingRouteParam.push(match.substr(1));
      return ":";
    }));

    result.origin[mapingRouteKey] = routeRule;

    if(mapingRouteKey[mapingRouteKey.length-1] === "/"){
      mapingRouteKey = mapingRouteKey.substr(0, mapingRouteKey-1);
    }

    result.maping[mapingMethod][mapingRouteKey] = {
      param: mapingRouteParam,
      action: routes[routeRule]
    };

    // 生成路径树 tree
    const treeNodePaths = mapingRouteKey.split("/");
    if(treeNodePaths[0] === '') treeNodePaths.shift();
    const treeNodePathLast = treeNodePaths.length-1;
    let parentTreePath = result.tree;

    _each(treeNodePaths, function(p,index){
      if(!parentTreePath[p]){
        parentTreePath[p] = {};
      }

      if(treeNodePathLast !== index){
        parentTreePath = parentTreePath[p];
      }else{
        parentTreePath[p] = true;
      }
    });
  });

  result.need = !!_size(result.need);

  return Object.freeze(result);
}

module.exports = function(abcJSONMockConfig = {}) {
  const config = _merge({
    debug: false,
  }, abcJSONMockConfig);

  var rules = generateMapTree(require(mockServer), config);

  // 原生NODE探测文件的更改动态更新rules
  fs.watch(mockServer, { recursive: true }, (type, filename)=>{
    try{
      delete require.cache[require.resolve(mockServer)];
      delete require.cache[require.resolve(mockServer+"/"+filename)];
      rules = generateMapTree(require(mockServer), config);
    }catch(e){
      error("[mock server] liveing update source mockfile script throw unexcept error".red);
    }
  });

  // 生成中间件
  return function(req, res, next){
    if(!rules.need) return next();

    const url = req.originalUrl;
    const actions = rules.maping[req.method];

    let requestPath = url.split("#")[0].split("?")[0];
    let matchPath = "";
    let match = false;
    let paramValue = [];

    if(requestPath[0] === "/"){
      requestPath = requestPath.substr(1);
      matchPath = "/";
    }

    if(requestPath[requestPath.length-1] === "/"){
      requestPath = requestPath.substr(0, requestPath.length-1);
    }

    let route = requestPath.split("/");
    for(let i=0, l=route.length, p=rules.tree, _p; i<l; i++){
      _p = p[":"];
      p = p[route[i]];

      if(p === true){
        match = p;
        break;
      }

      if(_isObj(p)){
        continue;
      }

      if(!p){
        p = _p;

        if(p){
          paramValue.push(route[i]);
          route[i] = ":";

          if(p === true){
            match = p;
            break;
          }

          continue;

        }else{

          break;
        }

      }

      break;
    }

    // 匹配到对应的路径
    if(match && actions){
      matchPath += route.join("/");

      if(actions[matchPath]){
        const find = actions[matchPath];

        if(config.debug) log(`${"[mock server]".bold} route match => ${(rules.origin[matchPath] || url).green.bold}`);

        if(_isFn(find.action)){
          return (asyncHandler(find.action))(req, res, _combined(find.param, paramValue), _paramParse(url), next);
        }else if(find.action && _isObj(find.action)){
          res.json(find.action);
        }else{
          error(`[mock server] exec action unexcept error on dispatch the route => ${matchPath.bold}`.red);
        }
      }else{
        error(`[mock server] not defined action event with path matcher => ${matchPath.bold}`.red);
      }
    }

    return next();
  };
};
