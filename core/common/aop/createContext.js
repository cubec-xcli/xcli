const utils = require('../../utils');
const servers = require('../../servers');
const { merge } = require('lodash');

module.exports = function(extendContext = {}){
  return merge({
    utils: utils,
    servers: servers,
  }, extendContext);
};
