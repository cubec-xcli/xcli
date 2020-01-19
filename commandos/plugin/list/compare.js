const axios = require('axios');
const struct = require('ax-struct-js');
const compareVersions = require('compare-versions');
const cache = require('../../../core/utils/cache');
const getAotPluginSource = require('../../../core/common/pre/getAotPluginSource');
const { pluginSourceGit, pluginSourceGitPath, pluginSourceGroup } = getAotPluginSource();

const one = struct.index('one');

const rawSourcePath = {
  "github": "https://raw.githubusercontent.com",
  "gitlab": `https://${pluginSourceGitPath}`,
};

const domain = rawSourcePath[pluginSourceGit];

module.exports = async function(currentVersion, pluginName, isLinked=false, isDiffSource=false){
  let abcxJSONSource = '';
  let axiosHeaders = {};

  // 来自不同的安装源
  if(isDiffSource){
    // 插件是来自不同的安装源，则不需要执行比较
    return {
      plugin: pluginName,
      isLinked,
      text: (`[Plugin] `.bold + pluginName.bold.red + ` ${currentVersion}`),
      newVersion: currentVersion,
      needUpdate: false
    };

  // 插件不是link调试的形式，是正常的插件包则执行比较
  }else if(!isLinked){
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
          simple: true,
          per_page: 1000,
          recursive: true
        }
      });

      // fuck gitLab
      let list = one(getGitLabProjects.data, (project)=>project.path_with_namespace === pluginRemoteGitLabPath);
      // console.log(list);


      // fuck gitLab
      const projectId = list ? list.id : null;

      if(projectId == null){
        return {
          plugin: pluginName,
          isLinked,
          text: `[Plugin]`.bold+` ${pluginName}`.bold.red,
          newVersion: currentVersion,
          needUpdate: false
        };
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
      (`[Plugin] `.bold + pluginName.bold.red + ` ${currentVersion}` + ` - [ New Version ${onlineVersion} ]`.green.bold) :
      (`[Plugin] `.bold + pluginName.bold.red + ` ${currentVersion} `),
      newVersion: onlineVersion,
      needUpdate: compareResult
    };
  }

  // 否则是linked的调试插件包，不需要升级
  return {
    plugin: pluginName,
    isLinked,
    text:
      (`[Plugin] `.bold + pluginName.bold.red + ` [linked]`.green),
    newVersion: "linked",
    needUpdate: false
  };
};

