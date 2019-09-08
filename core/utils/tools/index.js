const existDir = require('./file/existDir');
const walker = require('./file/walker');
const openBrowser = require('./system/openBrowser');
const optimizeCssModulesPlugin = require('./system/optimizeCssModulesPlugin');

module.exports = {
  file: {
    existDir,
    walker,
  },
  system: {
    openBrowser,
    optimizeCssModulesPlugin
  }
};
