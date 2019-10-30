const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const fse = require('fs-extra');
const paths = require('../../core/utils/paths');
const PLUGIN = require('../../dict/commandos/PLUGIN');

const useInstall = require('./install');
const useUninstall = require('./uninstall');
const useList = require('./list');
const useUpdate = require('./update');
const { prefixAbcJSON } = require('../../core/utils/abc');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');
const createArgs = require('../../core/common/aop/createArgs');

const has = struct.has();

const useCommandosList = [
  'install',
  'add',
  'uninstall',
  'remove',
  'list',
  'all',
  'update',
  'upgrade'
];

const useCurrentCommandosList = [
  'install',
  'uninstall',
  'list',
  'update',
];

const useCommandosAlias = {
  install: useInstall,
  add: useInstall,
  uninstall: useUninstall,
  remove: useUninstall,
  list: useList,
  all: useList,
  update: useUpdate,
  upgrade: useUpdate
};

const pluginCommand = async function(use, pluginName){
  let result;
  let useCommand = use;
  // extend command in project create by plugin
  const isExtendCommand = prefixAbcJSON ? getTargetEntryJS(prefixAbcJSON.type , `extend/${use}.js`) : null;

  createArgs();

  if(isExtendCommand){
    result = await isExtendCommand(createContext(),{});
  }else{
    if(!useCommand || !has(useCommandosList, useCommand)){
      // 没有找到对应的命令
      const { command } = await prompt({
        type: "select",
        name: "command",
        message: PLUGIN.PLUGIN_SELECT_COMMAND_TYPE,
        choices: useCurrentCommandosList
      });

      useCommand = command;
    }

    const getCommand = useCommandosAlias[useCommand];
    await fse.ensureDir(paths.pluginsPath);
    result = await getCommand(pluginName);
  }

  return result;
};

module.exports = pluginCommand;
