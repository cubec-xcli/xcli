const fs = require('fs');
const path = require('path');
const paths = require('../../utils/paths');
const { isString } = require('lodash');

module.exports = function(pluginType, findBuiltIn=false){
  if(!pluginType || !isString(pluginType)) return false;

  const pluginsPath = fs.existsSync(path.resolve(paths.pluginsPath, pluginType));
  const localPluginsPath = fs.existsSync(path.resolve(paths.currentPath, `node_modules/${pluginType}`));

  return pluginsPath || localPluginsPath;
};
