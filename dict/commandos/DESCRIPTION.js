const colors = require('colors');

module.exports = {
  dev     : "start super devServer".cyan,
  init    : "(init|create) project template".red,
  lint    : "checkout project with ESLint".red,
  plugin  : "xcli plugin manager".magenta,
  link    : "[development] link plugin for xcli",
  unlink  : "[development] unlink plugin for xcli",
  help    : '[development] check help infomation',
  upgrade : "upgrade xcli core".red,
  test    : "run UT and living preview test for project".cyan,
  build   : "run fast building project".green,
  publish : "publish project optional".yellow,
};
