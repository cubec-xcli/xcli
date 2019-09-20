const fs = require('fs');
const { fork } = require('child_process');
const path = require('path');
const paths = require('../../core/utils/paths');
const { prefixAbcJSON } = require('../../core/utils/abc');
const { debug, info } = require('../../core/utils/std');
const DEV = require('../../dict/commandos/DEV');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');

const devCommand = function(command){
  if(checkAbcJSONFormat()){
    const isDebugMode = command ? !!command.debug : false;
    const devServerJS = path.resolve(__dirname, "childprocess/devServer.js");
    const devServer = getTargetEntryJS(prefixAbcJSON.type, "devServer.js");

    if(devServer && !isDebugMode) packageAutoInstall();

    // 是否存在对应的插件
    if(devServer){
      info(DEV.INFO_DEVSERVER_LOGXCLIVERSION);

      // fork 子进程
      let childDevProcess = fork(devServerJS, [isDebugMode, false], { stdio: 'inherit' });

      fs.watchFile(paths.currentPath+"/abc.json", function(){
        debug("detect abc.json change, restart dev server");
        childDevProcess.kill('SIGINT');
        childDevProcess = fork(devServerJS, [isDebugMode, true], { stdio: 'inherit' });
      });
    }
  }
};

module.exports = devCommand;
