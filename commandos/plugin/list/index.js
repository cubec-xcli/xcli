const fs = require('fs');
const path = require('path');
const util = require('util');
const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const compareVersion = require('./compare');
const { pluginSourceGit } = require('../../../config/pluginSourceRepository');
const { warn } = require('../../../core/utils/std');
const paths = require('../../../core/utils/paths');
const cache = require('../../../core/utils/cache');

const cool = struct.cool();
const each = struct.each();

module.exports = async function(){
  const fsreaddir = util.promisify(fs.readdir);

  if(pluginSourceGit === "gitlab" && !cache.getGlobal("gitlabToken")){
    const { gitlabToken } = await prompt({
      type: "input",
      name: "gitlabToken",
      message: "Input your gitlab Personal Access Token (PAT)"
    });

    if(!gitlabToken && gitlabToken.length < 5) return warn("plugin list preview interrupted");

    cache.setGlobal("gitlabToken", gitlabToken);
  }

  const plugins = await fsreaddir(paths.pluginsPath);

  const printList = await Promise.all(plugins.map(plugin=>{
    let getAbcxJSON = {};

    try {
      getAbcxJSON = require(path.resolve(paths.pluginsPath, `${plugin}/abcx.json`));
    }catch(e){
      return false;
    }

    if(!getAbcxJSON["plugin-version"]) return false;

    return compareVersion(getAbcxJSON["plugin-version"], plugin);
  }).filter(cool));

  if(printList.length)
    return each(printList, (line)=>console.log(line));

  return warn("not plugins find install for xcli");
};
