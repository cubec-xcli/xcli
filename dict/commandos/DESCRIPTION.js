const colors = require('colors');

module.exports = {
  dev     : "start super devServer".cyan,
  init    : "(init|create) project template".red,
  lint    : "checkout project".red,
  plugin  : "plugin manager".magenta,
  link    : "[development] link plugin for xcli",
  unlink  : "[development] unlink plugin for xcli",
  test    : "run [Jest] unit test for project".green,
  build   : "run building project".green,
  publish : "publish project optional".yellow,
};
