const log = require('./log');
const info = require('./info');
const warn = require('./warn');
const error = require('./error');
const loading = require('./loading');
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
  loading,
  colors,
  createLabel
};
