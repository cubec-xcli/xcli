const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const fse = require('fs-extra');
const paths = require('../../core/utils/paths');
const PLUGIN = require('../../dict/commandos/PLUGIN');

const useInstall = require('./install');
const useUninstall = require('./uninstall');
const useList = require('./list');
const useUpdate = require('./update');

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
  let useCommand = use;


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

  const result = await getCommand(pluginName);

  return result;
};

module.exports = pluginCommand;
