const fs = require('fs');
const path = require('path');
const paths = require('../../utils/paths');
const { isString } = require('lodash');

module.exports = function(pluginType, findBuiltIn=false){
  if(!pluginType || !isString(pluginType)) return false;

  return fs.existsSync(path.resolve(paths.pluginsPath, pluginType)) || (findBuiltIn ?
         fs.existsSync(path.resolve(paths.pluginsBuiltinPath, pluginType)) : false);
};
