const colors = require('colors');
const fs = require('fs');
const path = require('path');
const { isString } = require('lodash');
const { error } = require('../../utils/std');
const ERRORS = require('../../../dict/std/ERRORS');

const checkPluginAbcxJSONFormat = function(){
  let abcxJSON = {};
  const abcxJSONPath = path.resolve(process.cwd(), "abcx.json");

  if(!fs.existsSync(abcxJSONPath)){
    error(ERRORS.ABCJSON.X_NOT_EXIST + `${'abcx.json'.bold}`);
    return false;
  }

  try{
    abcxJSON = require(abcxJSONPath);
  }catch(e){
    error(ERRORS.ABCJSON.X_NOTAS_JSONFORMAT);
    return false;
  }

  // console.log(abcxJSON);

  if(
    !abcxJSON["plugin-name"] ||
    !isString(abcxJSON["plugin-name"]) ||
    abcxJSON["plugin-name"].length < 2
  ){
    error(ERRORS.ABCJSON.X_NOT_PASSCHECK);
    return false;
  }

  return true;
};

module.exports = checkPluginAbcxJSONFormat;
