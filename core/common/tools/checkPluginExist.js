const fs = require('fs');
const path = require('path');
const paths = require('../../utils/paths');

module.exports = function(pluginType){
  pluginType = pluginType || "___not_exist__?";

  return fs.existsSync(path.resolve(paths.pluginsPath, pluginType));
};
