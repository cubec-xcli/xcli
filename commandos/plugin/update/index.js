const fs = require('fs');
const path = require('path');
const util = require('util');
const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const compareVersion = require('../list/compare');
const { warn, info } = require('../../../core/utils/std');
const paths = require('../../../core/utils/paths');
const cache = require('../../../core/utils/cache');
const checkPluginExist = require('../../../core/common/tools/checkPluginExist');
const COMMON = require('../../../dict/commandos/COMMON');
const PLUGIN = require('../../../dict/commandos/PLUGIN');
const getAotPluginSource = require('../../../core/common/pre/getAotPluginSource');
const { pluginSourceGit, pluginSourceGroup, pluginSourceGitPath } = getAotPluginSource();

const pluginInstall = require('../install');

const cool = struct.cool();
const each = struct.each();
const one = struct.index("one");
const eq = struct.eq();

module.exports = async function(pluginName){
  const fsreaddir = util.promisify(fs.readdir);

  if(pluginSourceGit === "gitlab" && !cache.getGlobal("gitlabToken")){
    const { gitlabToken } = await prompt({
      type: "input",
      name: "gitlabToken",
      message: COMMON.REQUIRED_INPUT_GITLAB_PAT
    });

    if(!gitlabToken && gitlabToken.length < 5) return warn(PLUGIN.PLUGIN_UPDATE_COMMAND_INTERRUPTED);

    cache.setGlobal("gitlabToken", gitlabToken);
  }

  if(pluginSourceGit === "github" && !cache.getGlobal("githubToken")){
    const { githubToken } = await prompt({
      type: "input",
      name: "githubToken",
      message: COMMON.REQUIRED_INPUT_GITHUB_PAT
    });

    if(!githubToken && githubToken.length < 5) return warn(PLUGIN.PLUGIN_LIST_COMMAND_INTERRUPTED);

    cache.setGlobal("githubToken", githubToken);
  }

  // 如果输入插件名称，但是插件又不存在，则不允许操作
  if(pluginName && !checkPluginExist(pluginName))
    return warn(PLUGIN.PLUGIN_UPDATE_NOEXIST_PLUGIN+pluginName);

  const plugins = pluginName ? [pluginName] : await fsreaddir(paths.pluginsPath);

  const pluginsList = await Promise.all(plugins.map(plugin=>{
    let getAbcxJSON = {};
    const currentPluginPath = path.resolve(paths.pluginsPath, `${plugin}`);
    const stats = fs.lstatSync(currentPluginPath);

    if(stats.isSymbolicLink()){
      return compareVersion(false, plugin, true, false);
    }else if(stats.isDirectory()){
      try {
        getAbcxJSON = require(path.resolve(currentPluginPath, `abcx.json`));
      }catch(e){
        return false;
      }

      if(!getAbcxJSON["plugin-version"]) return false;

      // 插件是否来自于不同于当前的源
      const isDiffSouce = !eq(getAbcxJSON["plugin-source"], {
        pluginSourceGit,
        pluginSourceGitPath,
        pluginSourceGroup
      });

      return compareVersion(getAbcxJSON["plugin-version"], plugin, false, isDiffSouce);
    }

    // 其他形式的文件都不被视为插件
    return false;
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
        message: PLUGIN.PLUGIN_UPDATE_SELECT_REQUIRED,
        choices: pluginsChoicesList
      });

      if(updateList.length){
        await Promise.all(updateList.map((updatePlugin)=>{
          const getPlugin = pluginsListMap[updatePlugin];
          return pluginInstall(getPlugin.plugin, true);
        }));

        return info(PLUGIN.PLUGIN_UPDATE_SUCCESS_COMPLETED);
      }

      return warn(PLUGIN.PLUGIN_UPDATE_NOSELECT);
    }
  }

  return info(PLUGIN.PLUGIN_UPDATE_ALREADY_LATEST_VERSION);
};
