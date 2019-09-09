const fs = require('fs');
const path = require('path');
const util = require('util');
const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const compareVersion = require('../list/compare');
const { pluginSourceGit } = require('../../../config/pluginSourceRepository');
const { warn, info } = require('../../../core/utils/std');
const paths = require('../../../core/utils/paths');
const cache = require('../../../core/utils/cache');
const checkPluginExist = require('../../../core/common/tools/checkPluginExist');

const pluginInstall = require('../install');

const cool = struct.cool();
const each = struct.each();
const one = struct.index("one");

module.exports = async function(pluginName){
  const fsreaddir = util.promisify(fs.readdir);

  if(pluginSourceGit === "gitlab" && !cache.getGlobal("gitlabToken")){
    const { gitlabToken } = await prompt({
      type: "input",
      name: "gitlabToken",
      message: "Input your gitlab Personal Access Token (PAT)"
    });

    if(!gitlabToken && gitlabToken.length < 5) return warn("plugin update process interrupted");

    cache.setGlobal("gitlabToken", gitlabToken);
  }

  const plugins = pluginName && checkPluginExist(pluginName) ? [pluginName] : await fsreaddir(paths.pluginsPath);

  const pluginsList = await Promise.all(plugins.map(plugin=>{
    let getAbcxJSON = {};

    try {
      getAbcxJSON = require(path.resolve(paths.pluginsPath, `${plugin}/abcx.json`));
    }catch(e){
      return false;
    }

    if(!getAbcxJSON["plugin-version"]) return false;

    return compareVersion(getAbcxJSON["plugin-version"], plugin);
  }).filter(cool));


  if(pluginsList.length){
    const pluginsListMap = {};
    const pluginsChoicesList = [];

    each(pluginsList, item=>{
      pluginsListMap[item.text] = item;

      if(item.needUpdate)
        pluginsChoicesList.push({
          name: item.text,
          value: item.text,
          pluginName: item.plugin,
          newVersion: item.newVersion,
          org: item
        });
    });

    // 直接升级单体插件
    const getSignPlugin = one(pluginsChoicesList, item=>item.pluginName === pluginName);
    if(pluginName && getSignPlugin){
      await pluginInstall(pluginName, true);
      return info(`${("["+pluginName+"]").bold} update to latest version ${("["+getSignPlugin.newVersion+"]").white}`);

    // 存在可以升级的插件
    } else if(!pluginName && pluginsChoicesList.length){
      const { updateList } = await prompt({
        type: "multiselect",
        name: "updateList",
        message: "Select plugin for update",
        choices: pluginsChoicesList
      });

      if(updateList.length){
        await Promise.all(updateList.map((updatePlugin)=>{
          const getPlugin = pluginsListMap[updatePlugin];
          return pluginInstall(getPlugin.plugin, true);
        }));
        return info("all plugins were updated to latest version");
      }

      return warn("no select plugin for update");
    }
  }

  return info("all plugins already hold on latest version");
};
