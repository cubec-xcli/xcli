const fs = require('fs');
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const {exec, execSync} = require('child_process');
const simpleGitCreate = require('simple-git');

const {printCommanLog, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function() {
  printCommanLog();

  const Git = simpleGitCreate(paths.xcliPath);

	Git.pull(function(a,b,c){
    const packageJSON = require('../package.json');
    log(`xcli更新成功 - 当前版本: ${packageJSON.version}`)
	});
};
