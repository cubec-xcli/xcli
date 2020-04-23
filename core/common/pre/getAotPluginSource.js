const fs = require('fs');
const path = require('path');
const paths = require('../../utils/paths');
const defaultPluginSourceRepository = require('../../../config/defaultPluginSourceRepository');

const pluginSourceConfigPath = path.resolve(paths.cliRootPath, ".pluginsource.js");

module.exports = function(){
  if(fs.existsSync(pluginSourceConfigPath)) return require(pluginSourceConfigPath);

  return defaultPluginSourceRepository;
};
