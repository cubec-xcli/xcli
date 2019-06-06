const fs = require('fs');
const { fork } = require('child_process');
const util = require('../lib/util');

const {preinstall, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function(param) {
  // use child_process
  if (abcJSON) {
    if(!param || (param != "debug" && param != "d")) preinstall();

    let devServer = fork(paths.xcliPath + "/scripts/patch/dev_webpack_server.js",[param]);

    fs.watchFile(paths.currentPath+"/abc.json", function(){
      log("detect abc.json change, restart dev server");
      devServer.kill('SIGINT');
      devServer = fork(paths.xcliPath + "/scripts/patch/dev_webpack_server.js",[param]);
    });

  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
