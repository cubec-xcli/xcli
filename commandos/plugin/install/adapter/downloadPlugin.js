const download = require('download-git-repo');
const getAotPluginSource = require('../../../../core/common/pre/getAotPluginSource');
const {
  pluginSourceGit,
  pluginSourceGroup,
  pluginSourceGitPath
} = getAotPluginSource();

const { warn, error } = require('../../../../core/utils/std');

const parsePluginDownloadUrl = function(pluginName){
  if(pluginSourceGit === "github"){
    return `${pluginSourceGroup}/${pluginName}`;
  }else if(pluginSourceGit === "gitlab"){
    return `${pluginSourceGit}:${pluginSourceGitPath}:${pluginSourceGroup}/${pluginName}#master`;
  }
  warn("plugin install unknown gitSource options");
  return false;
};

module.exports = function(pluginName, targetFilePath){
  const url = parsePluginDownloadUrl(pluginName);
  // console.log(url);

  if(url && targetFilePath){
    return new Promise((resolve, reject) => {
      if(pluginSourceGit === "github"){
        download(url, targetFilePath, function(err){
          if(err){
            error("remote plugin download failed with unexcepted error");
            error(err);
            return reject(err);
          }
          resolve(true);
        });
      }else if(pluginSourceGit === "gitlab"){
        download(url, targetFilePath, { clone: true }, function(err){
          if(err){
            error("remote plugin download failed with unexcepted error");
            error(err);
            return reject(err);
          }
          resolve(true);
        });
      }else{
        return reject(new TypeError("unknown git source type"));
      }
    });
  }

  return null;
};
