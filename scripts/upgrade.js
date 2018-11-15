
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const simpleGitCreate = require('simple-git');

const {preinstall, printCommanLog, paths, abcJSON} = util;
const {log} = util.msg;

module.exports = function() {
  printCommanLog();

  // upgrade package
  const Git = simpleGitCreate(paths.xcliPath);

  Git.pull(function(){
    const packageJSON = require('../package.json');
    log(`xcli upgrade success - current version: ${packageJSON.version}`);
    log(`xcli upgrade prepare upgrade npm packages...`);
    preinstall(path.resolve(__dirname, "../"));
    log(`xcli upgrade completed!`);
  });
};
