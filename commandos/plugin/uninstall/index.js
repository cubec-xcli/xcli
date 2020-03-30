const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const struct = require('ax-struct-js');
const { prompt } = require('enquirer');
const paths = require('../../../core/utils/paths');
const { info, warn } = require('../../../core/utils/std');

const cool = struct.cool();
const each = struct.each();

const PLUGIN = require('../../../dict/commandos/PLUGIN');

module.exports = async function(pluginName){
  let plugin = pluginName;
  const pluginsDir = paths.pluginsPath;

  if(!plugin){
    const getAllPlugins = fs.readdirSync(pluginsDir).filter(name=>name[0]!==".");
    const pluginListMap = {};

    // 收集选择列表
    const choices = getAllPlugins.map(function(pluginFolder){
      const pluginPath = path.resolve(pluginsDir, pluginFolder);
      const pluginAbcxJSON = require(path.resolve(pluginPath, 'abcx.json'));
      const fsstats = fs.lstatSync(pluginPath);

      if(fsstats.isSymbolicLink() || !fsstats.isDirectory()) return false;

      const value = `${'[Plugin]'.bold} ${pluginFolder.bold.red} ${("["+pluginAbcxJSON["plugin-version"]+"]").green} - [${pluginAbcxJSON["plugin-description"]||""}]`;

      pluginListMap[value] = pluginFolder;

      return value;

    }).filter(cool);

    // 批量选择需要卸载的插件
    const { pluginSelect } = await prompt({
      type: 'multiselect',
      name: "pluginSelect",
      message: PLUGIN.PLUGIN_UNINSTALL_SELECT_REQUIRED,
      choices,
    });

    plugin = pluginSelect.map(plugin=>pluginListMap[plugin]);
  }else{
    plugin = [plugin];
  }

  if(plugin.length){
    each(plugin, function(pluginFolder){
      const pluginPath = path.resolve(pluginsDir, pluginFolder);

      if(fs.existsSync(pluginPath)){
        const fsstats = fs.lstatSync(pluginPath);

        // 如果是link file 则不删除
        if(!fsstats.isSymbolicLink())
          fse.removeSync(pluginPath);
      }
    });

    info(PLUGIN.PLUGIN_UNINSTALL_SUCCESSED);

    return true;
  }

  warn(PLUGIN.PLUGIN_UNINSTALL_NOPLUGINS_SELECTED);

  return false;
};
