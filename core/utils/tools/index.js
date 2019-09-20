// file
const existDir = require('./file/existDir');
const walker = require('./file/walker');
// modules
const enquirer = require('./modules/enquirer');
const fsextra = require('./modules/fsextra');
const struct = require('./modules/struct');
const lodash = require('./modules/lodash');
const axios = require('./modules/axios');
// system
const openBrowser = require('./system/openBrowser');
const optimizeCssModulesPlugin = require('./system/optimizeCssModulesPlugin');
// std
const enquirerSelectKeyMapInfo = require('./std/enquirerSelectKeyMapInfo');

module.exports = {
  file: {
    existDir,
    walker,
  },
  modules: {
    enquirer,
    fsextra,
    struct,
    lodash,
    axios,
  },
  system: {
    openBrowser,
    optimizeCssModulesPlugin
  },
  std: {
    enquirerSelectKeyMapInfo
  }
};
