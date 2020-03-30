const colors = require('colors');
const { isPlainObject } = require('lodash');
const ERRORS = require('../../../dict/std/ERRORS');

const { warn, error } = require('../../utils/std');
const { abcJSON, prefixAbcJSON } = require('../../utils/abc');

// const checkPluginExist = require('../tools/checkPluginExist');

// 检测abcJSON 是否合法，并且检测是否有对应的插件可执行
const checkAbcJsonFormat = function(){

  if(!isPlainObject(abcJSON))
    return error(ERRORS.ABCJSON.NOTEXIST);

  if(!abcJSON.type || !abcJSON.name)
    return error(ERRORS.ABCJSON.NOTYPEORNAME);

  // if(!checkPluginExist(abcJSON.type, true)){
  //   warn(ERRORS.ABCJSON.TRYTOINSTALLPLUGIN + `[${abcJSON.type}]`.bold);
  //   return false;
  // }

  return prefixAbcJSON;
};

module.exports = checkAbcJsonFormat;
