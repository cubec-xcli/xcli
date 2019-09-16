const fs = require('fs');
const path = require('path');
const paths = require('../../utils/paths');
const defaultPluginSourceRepository = require('../../../config/defaultPluginSourceRepository');

module.exports = function(){
  const pluginSourceConfigPath = path.resolve(paths.cliRootPath, ".pluginsource.js");

  if(fs.existsSync(pluginSourceConfigPath)) return require(pluginSourceConfigPath);

  return defaultPluginSourceRepository;
};
