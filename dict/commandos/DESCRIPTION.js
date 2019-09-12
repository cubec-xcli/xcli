const colors = require('colors');

module.exports = {
  new             : "(new|create) [project] with (abc.json) or [development] new [xcli] plugin".red,
  create          : "fast create project template by plugin".red,
  plugin          : "xcli plugin manager".magenta,
  dev             : "start super devServer".cyan,
  lint            : "checkout project with ESLint".red,
  test            : "run UT and living preview test".cyan,
  build           : "run fast building project".green,
  publish         : "publish project optional".yellow,
  upgrade         : "upgrade xcli core".red,
  setRemotePlugin : "[development] set plugin remote source git repository",
  link            : "[development] link plugin for xcli",
  unlink          : "[development] unlink plugin for xcli",
  help            : '[development] check help infomation',
};
