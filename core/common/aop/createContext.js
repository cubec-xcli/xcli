const utils = require('../../utils');
const servers = require('../../servers');
const { merge } = require('lodash');
const struct = require('ax-struct-js');

const extend = struct.extend();

module.exports = function(extendContext = {}){
  const context = {
    utils: utils,
    servers: servers,
  };

  context.utils.paths = extend({}, utils.paths, [
    "cliRootPath",
    "cacheFilePath",
    "pluginsPath",
    "pluginsBuiltinPath",
  ]);

  return merge({}, context, extendContext);
};
