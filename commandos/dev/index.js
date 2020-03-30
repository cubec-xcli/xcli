const fs = require('fs');
const { fork } = require('child_process');
const struct = require('ax-struct-js');
const path = require('path');
const paths = require('../../core/utils/paths');
const { prefixAbcJSON } = require('../../core/utils/abc');
const { debug, info } = require('../../core/utils/std');
const DEV = require('../../dict/commandos/DEV');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const getAotPluginSource = require('../../core/common/pre/getAotPluginSource');

const xcliPluginSourceConfig = getAotPluginSource();
const compare = require('../plugin/list/compare');

const eq = struct.eq();

const devCommand = async function(command){
  if(checkAbcJSONFormat()){
    const isDebugMode = command ? !!command.debug : false;
    const devServerJS = path.resolve(__dirname, "childprocess/devServer.js");
    const devServer = await getTargetEntryJS(prefixAbcJSON.type, "devServer.js");

    // 是否存在对应的插件
    if(devServer){
      const pluginAbcxJSON = require(path.resolve(paths.pluginsUsagePath, 'abcx.json'));
      const pluginSource = pluginAbcxJSON['plugin-source'];
      const pluginPathstats = fs.lstatSync(paths.pluginsUsagePath);

      // 可以拿到插件，并且插件不是调试状态
      if(
        !pluginPathstats.isSymbolicLink() &&
        pluginSource &&
        eq(pluginSource, xcliPluginSourceConfig)){

        let compareResult;

        // 检测版本非必须操作
        try{
          compareResult = await compare(pluginAbcxJSON["plugin-version"], prefixAbcJSON.type);

          if(compareResult &&
            compareResult.needUpdate &&
            compareResult.newVersion){
            info(`${"[Plugin Update Request]".bold} ${("["+prefixAbcJSON.type+"]").red.bold} ${"a new version".green.bold} ${("["+compareResult.newVersion+"]").yellow.bold} ${"is available! run".green} ${"[xcli plugin update]".yellow.bold} ${"for you need".green}`);
          }

        }catch(e){
          //eslint-disable
        }
      }

      if(devServer && !isDebugMode) packageAutoInstall();

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
