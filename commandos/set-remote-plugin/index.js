const fs = require('fs');
const path = require('path');
const util = require('util');
const { isString } = require('lodash');
const { error, info } = require('../../core/utils/std');
const paths = require('../../core/utils/paths');
const defaultConfig = require('../../config/defaultPluginSourceRepository');

const setRemotePluginCommand = async function(configFile){
  if(configFile){
    let newConfig;
    const file = path.resolve(paths.currentPath, configFile);

    if(fs.existsSync(file)){

      try {
        newConfig = require(file);
        newConfig = JSON.parse(JSON.stringify(newConfig));
      }catch(e){
        error("config file is not JSON standard format");
        return error(e);
      }

      // check config
      if(
        !newConfig.pluginSourceGit ||
        !newConfig.pluginSourceGitPath ||
        !newConfig.pluginSourceGroup ||
        !isString(newConfig.pluginSourceGit) ||
        !isString(newConfig.pluginSourceGitPath) ||
        !isString(newConfig.pluginSourceGroup) ||
        (newConfig.pluginSourceGit !== "github" &&
         newConfig.pluginSourceGit !== "gitlab")
      ){
        return error("config file is unexpected error with unkown options");
      }

      const fswriteFile = util.promisify(fs.writeFile);
      const configFilePath = path.resolve(paths.cliRootPath, ".pluginsource.js");

      await fswriteFile(configFilePath, `module.exports=${JSON.stringify(newConfig||defaultConfig)}`,);

      return info("update remote plugin config success");
    }

    return error(`no config file exist ${configFile}`);
  }

  return error("no config file to set");
};

module.exports = setRemotePluginCommand;
