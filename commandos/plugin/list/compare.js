const axios = require('axios');
const struct = require('ax-struct-js');
const compareVersions = require('compare-versions');
const {
  pluginSourceGit,
  pluginSourceGitPath,
  pluginSourceGroup,
} = require('../../../config/.pluginSourceRepository.js');
const cache = require('../../../core/utils/cache');

const one = struct.index('one');

const rawSourcePath = {
  "github": "https://raw.githubusercontent.com",
  "gitlab": `https://${pluginSourceGitPath}`,
};

const domain = rawSourcePath[pluginSourceGit];

module.exports = async function(currentVersion, pluginName, isLinked=false){
  let abcxJSONSource = '';
  let axiosHeaders = {};

  if(!isLinked){
    if(pluginSourceGit === "github"){
      abcxJSONSource = `${domain}/${pluginSourceGroup}/${pluginName}/master/abcx.json`;
    }else if(pluginSourceGit === "gitlab"){
      // abcxJSONSource = `${domain}/${pluginSourceGroup}/${pluginName}/raw/master/abcx.json`;
      // console.log(abcxJSONSource);
      const pluginRemoteGitLabPath = `${pluginSourceGroup}/${pluginName}`;
      const token = cache.getGlobal("gitlabToken");
      axiosHeaders = {
        "Private-Token": token,
        "X-Requested-With": "XMLHttpRequest"
      };

      // fuck gitLab
      const getGitLabProjects = await axios({
        method: "get",
        url: `${domain}/api/v4/projects/`,
        headers: axiosHeaders,
        params: {
          simple: true
        }
      });

      // fuck gitLab
      let list = one(getGitLabProjects.data, (project)=>project.path_with_namespace === pluginRemoteGitLabPath);

      // fuck gitLab
      const projectId = list ? list.id : null;

      if(projectId == null){
        return `[Plugin] ${pluginName}`;
      }

      abcxJSONSource = `${domain}/api/v4/projects/${projectId}/repository/files/abcx%2Ejson/raw`;
    }

    // 获取远程的abcx.json
    const getRemoateAbcxJSON = await axios({
      method: 'get',
      url: abcxJSONSource,
      headers: axiosHeaders,
      params: { ref: "master" }
    });

    const onlineVersion = getRemoateAbcxJSON.data["plugin-version"];
    const compareResult = compareVersions.compare(currentVersion, onlineVersion, "<");

    return {
      plugin: pluginName,
      isLinked,
      text: compareResult ?
      (`[Plugin] `.bold + pluginName.bold.red + ` ${currentVersion}` + ` - [ new version ${onlineVersion} ]`.green.bold) :
      (`[Plugin] `.bold + pluginName.bold.red + ` ${currentVersion}`),
      newVersion: onlineVersion,
      needUpdate: compareResult
    };
  }

  return {
    plugin: pluginName,
    isLinked,
    text:
      (`[Plugin] `.bold + pluginName.bold.red + ` [linked]`.green),
    newVersion: "linked",
    needUpdate: false
  };
};

