const download = require('download-git-repo');
const Config = require('../../../../config/pluginSourceRepository');
const { info, warn, error } = require('../../../../core/utils/std');

const parsePluginDownloadUrl = function(pluginName){
  const {
    pluginSourceGit,
    pluginSourceGroup,
    pluginSourceGitPath
  } = Config;

  if(pluginSourceGit === "github"){
    return `${pluginSourceGroup}/${pluginName}`;
  }else if(pluginSourceGit === "gitlab" || pluginSourceGit === "bitbucket"){
    return `${pluginSourceGit}:${pluginSourceGitPath}:${pluginSourceGroup}/${pluginName}#master`;
  }
  warn("plugin install unknown gitSource options");
  return false;
};

module.exports = function(pluginName, targetFilePath){
  const url = parsePluginDownloadUrl(pluginName);

  if(url && targetFilePath){
    return new Promise((resolve, reject) => {

      download(url, targetFilePath, { clone: true }, function(err){
        if(err){
          error(err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  return null;
};
