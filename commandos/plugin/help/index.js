const fs = require('fs');
const path = require('path');
const struct = require('ax-struct-js');
const { prompt } = require('enquirer');
const paths = require('../../../core/utils/paths');
const { prefixAbcJSON } = require('../../../core/utils/abc');
const { warn } = require('../../../core/utils/std');

const cool = struct.cool();
const PLUGIN = require('../../../dict/commandos/PLUGIN');

module.exports = async function(pluginName){
  let plugin = pluginName || (prefixAbcJSON ? prefixAbcJSON.type : null);
  const pluginsDir = paths.pluginsPath;

  if(!plugin){
    const getAllPlugins = fs.readdirSync(pluginsDir).filter(name=>name[0]!==".");
    const pluginListMap = {};

    const choices = getAllPlugins.map(function(pluginFolder){
      const pluginPath = path.resolve(pluginsDir, pluginFolder);
      const pluginAbcxJSON = require(path.resolve(pluginPath, 'abcx.json'));

      const fsstats = fs.lstatSync(pluginPath);
      const prefixVersion = (fsstats.isSymbolicLink() && fsstats.isDirectory()) ?
        "[linked]".green : ("["+pluginAbcxJSON["plugin-version"]+"]").yellow;

      const value = `${'[Plugin]'.bold} ${pluginFolder.bold.red} ${prefixVersion} - [${pluginAbcxJSON["plugin-description"]||""}]`;

      pluginListMap[value] = pluginFolder;

      return value;

    }).filter(cool);

    // 批量选择需要卸载的插件
    const { pluginSelect } = await prompt({
      type: 'autocomplete',
      name: "pluginSelect",
      message: PLUGIN.PLUGIN_HELP_SELECT_REQUIRED,
      choices,
    });

    plugin = pluginListMap[pluginSelect];
  }

  if(plugin){
    const getPluginPath = path.resolve(paths.pluginsPath, plugin);
    const getPluginHelpFile =
      fs.existsSync(path.resolve(getPluginPath, "README.md")) ?
      fs.readFileSync(path.resolve(getPluginPath, "README.md"), 'utf-8') :
      "";

    if(!getPluginHelpFile)
      return warn("can not find plugin help README.md");

    const marked = require('marked');
    const TerminalRenderer = require('marked-terminal');

    // render markdown
    marked.setOptions({
      // Define custom renderer
      renderer: new TerminalRenderer()
    });

    return console.log(marked(getPluginHelpFile));
  }

  return warn("can not find plugin help README.md");
};
