const colors = require('colors');
const fs = require('fs');
const path = require('path');
const { error } = require('../../utils/std');
const ERRORS = require('../../../dict/std/ERRORS');
const onlyCheckAbcxJSON = require('../tools/onlycheckAbcxJSONFormat');

const checkPluginAbcxJSONFormat = function(relativePath){
  let abcxJSON = {};
  const abcxJSONPath = path.resolve(relativePath || process.cwd(), "abcx.json");

  if(!fs.existsSync(abcxJSONPath)){
    error(ERRORS.ABCJSON.X_NOT_EXIST + `${'abcx.json'.bold}`);
    return false;
  }

  try{
    abcxJSON = require(abcxJSONPath);
    abcxJSON = JSON.parse(JSON.stringify(abcxJSON));
  }catch(e){
    error(ERRORS.ABCJSON.X_NOTAS_JSONFORMAT);
    return false;
  }

  return onlyCheckAbcxJSON(abcxJSON);
};

module.exports = checkPluginAbcxJSONFormat;
