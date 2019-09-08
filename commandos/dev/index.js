const fs = require('fs');
const { fork } = require('child_process');
const path = require('path');
const paths = require('../../core/utils/paths');
const { log } = require('../../core/utils/std');
// const DEV = require('../../dict/DEV');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');

const devCommand = function(command){
  if(checkAbcJSONFormat()){
    const isDebugMode = command ? !!command.debug : false;
    const devServerJS = path.resolve(__dirname, "childprocess/devServer.js");

    if(!isDebugMode) packageAutoInstall();

    let childDevProcess = fork(devServerJS, [isDebugMode, false]);

    fs.watchFile(paths.currentPath+"/abc.json", function(){
      log("detect abc.json change, restart dev server");
      childDevProcess.kill('SIGINT');
      childDevProcess = fork(devServerJS, [isDebugMode, true]);
    });
  }
};

module.exports = devCommand;
