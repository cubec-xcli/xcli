const fs = require('fs');
const path = require('path');
const util = require('util');
const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const compareVersion = require('./compare');
const { pluginSourceGit } = require('../../../config/.pluginSourceRepository.js');
const { warn } = require('../../../core/utils/std');
const paths = require('../../../core/utils/paths');
const cache = require('../../../core/utils/cache');
const COMMON = require('../../../dict/commandos/COMMON');
const PLUGIN = require('../../../dict/commandos/PLUGIN');

const cool = struct.cool();
const each = struct.each();

module.exports = async function(){
  const fsreaddir = util.promisify(fs.readdir);

  if(pluginSourceGit === "gitlab" && !cache.getGlobal("gitlabToken")){
    const { gitlabToken } = await prompt({
      type: "input",
      name: "gitlabToken",
      message: COMMON.REQUIRED_INPUT_GITLAB_PAT
    });

    if(!gitlabToken && gitlabToken.length < 5) return warn(PLUGIN.PLUGIN_LIST_COMMAND_INTERRUPTED);

    cache.setGlobal("gitlabToken", gitlabToken);
  }

  const plugins = await fsreaddir(paths.pluginsPath);

  const printList = await Promise.all(plugins.map(plugin=>{
    let getAbcxJSON = {};
    const currentPluginPath = path.resolve(paths.pluginsPath, `${plugin}`);
    const stats = fs.lstatSync(currentPluginPath);

    if(stats.isSymbolicLink()){
      return compareVersion(false, plugin, true);
    }else if(stats.isDirectory()){
      try {
        getAbcxJSON = require(path.resolve(currentPluginPath, `abcx.json`));
      }catch(e){
        return false;
      }

      if(!getAbcxJSON["plugin-version"]) return false;

      return compareVersion(getAbcxJSON["plugin-version"], plugin);
    }

    return false;

  }).filter(cool));

  if(printList.length)
    return each(printList, line=>console.log(line.text));

  return warn(PLUGIN.PLUGIN_LIST_NOTPLUGIN_FOUND);
};
