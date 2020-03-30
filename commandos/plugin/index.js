const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const path = require('path');
const paths = require('../../core/utils/paths');
const PLUGIN = require('../../dict/commandos/PLUGIN');
const { warn } = require('../../core/utils/std');

const useInstall = require('./install');
const useUninstall = require('./uninstall');
const useList = require('./list');
const useUpdate = require('./update');
const useHelp = require('./help');

const { prefixAbcJSON } = require('../../core/utils/abc');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const getTargetEntryJSWithoutCheckInstall = require('../../core/common/pre/getTargetEntryWithoutCheckInstall');
const createContext = require('../../core/common/aop/createContext');

const has = struct.has();
const slice = struct.slice();

const useCommandosList = [
  'install',
  'add',
  'uninstall',
  'remove',
  'list',
  'all',
  'update',
  'upgrade',
  'help',
  'info'
];

const useCurrentCommandosList = [
  'install',
  'uninstall',
  'list',
  'update',
  'help'
];

const useCommandosAlias = {
  install: useInstall,
  add: useInstall,
  uninstall: useUninstall,
  remove: useUninstall,
  list: useList,
  all: useList,
  update: useUpdate,
  upgrade: useUpdate,
  info: useHelp,
  help: useHelp
};

const pluginCommand = async function(use, pluginName){
  let useCommand = use;
  // extend command in project create by plugin
  const isExtendCommand = prefixAbcJSON ? await getTargetEntryJS(prefixAbcJSON.type , `extend/${use}.js`, true) : null;

  if(isExtendCommand){
    // 直接执行
    await isExtendCommand(createContext(),[]);

  }else{
    let exCommandsAlias = {};
    let useCommandosListPrefix = slice(useCommandosList);
    let useCurrentCommandosListPrefix = slice(useCurrentCommandosList);
    const extendPath = paths.pluginsUsagePath ? path.resolve(paths.pluginsUsagePath,'extend') : null;

    // 获取额外的命令
    if(prefixAbcJSON && prefixAbcJSON.type && extendPath && fs.existsSync(extendPath)){
      let exCommands = fs.readdirSync(extendPath);

      if(exCommands && exCommands.length){
        exCommands = exCommands.filter(name=>name[0] !== ".").forEach(name=>{
          const commandName = (name.replace(/\.[\w\W\s\S]*$/, ""));
          const exCommand = (commandName+" [Ex]").yellow.bold;

          exCommandsAlias[exCommand] = getTargetEntryJSWithoutCheckInstall(prefixAbcJSON.type, `extend/${name}`);
          exCommandsAlias[commandName] = exCommandsAlias[exCommand];

          useCommandosListPrefix.push(commandName);
          useCurrentCommandosListPrefix.push(exCommand);
        });
      }
    }

    if(!useCommand || !has(useCommandosListPrefix, useCommand)){
      // 没有找到对应的命令
      const { command } = await prompt({
        type: "select",
        name: "command",
        message: PLUGIN.PLUGIN_SELECT_COMMAND_TYPE,
        choices: useCurrentCommandosListPrefix
      });

      useCommand = command;
    }

    if(useCommandosAlias[useCommand]){
      const getCommand = useCommandosAlias[useCommand];
      await fse.ensureDir(paths.pluginsPath);
      await getCommand(pluginName);

    }else if(exCommandsAlias[useCommand]){
      const getExCommand = exCommandsAlias[useCommand];
      await getExCommand(createContext(),[]);

    }else{
      warn("can not exec command inside [plugin]");
    }

  }

  process.exit();
};

module.exports = pluginCommand;

