const log = require('./log');
const info = require('./info');
const warn = require('./warn');
const error = require('./error');
const loading = require('./loading');
const debug = require('./debug');
const success = require('./success');
const createLabel = require('./tools/createLabel');
const colors = require('./xtermcolors');

// log("log message");
// info("info message");
// warn("warn message");
// err("error message");

module.exports = {
  log,
  info,
  warn,
  error,
  debug,
  success,
  loading,
  colors,
  createLabel
};
