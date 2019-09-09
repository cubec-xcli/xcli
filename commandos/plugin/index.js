const { prompt } = require('enquirer');
const struct = require('ax-struct-js');

const has = struct.has();

const useInstall = require('./install');
const useUninstall = require('./uninstall');
const useList = require('./list');
const useUpdate = require('./update');

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
    const { command } = await prompt({
      type: "select",
      name: "command",
      message: "Select the type of action",
      choices: useCurrentCommandosList
    });
    useCommand = command;
  }

  const getCommand = useCommandosAlias[useCommand];

  const result = await getCommand(pluginName);

  return result;
};

module.exports = pluginCommand;
