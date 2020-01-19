const struct = require("ax-struct-js");
const colors = require("colors");
const getAotPluginSource = require('../../../../core/common/pre/getAotPluginSource');
const generateGitLabRequestApi =  require('../../../../core/common/pre/generateGitLabRequestAPI');
const generateGitHubRequestApi = require('../../../../core/common/pre/generateGitHubRequestAPI');

const { pluginSourceGit, pluginSourceGroup } = getAotPluginSource();

const _one = struct.index("one");
const _each = struct.each("array");
const _size = struct.size();

// 获取远程的插件列表
module.exports = async function(){
  let results = [];

  // gitlab 的获取方式
  if(pluginSourceGit === "gitlab"){
    const getGroups = await generateGitLabRequestApi("get", "groups");
    const gitlabGroups = getGroups.data || [];
    const getGroupsItem = _one(gitlabGroups, item=>item.full_path===pluginSourceGroup);

    if(getGroupsItem){
      const groupsId = getGroupsItem.id;
      const getAllPluginsProjects = await generateGitLabRequestApi("get", `groups/${groupsId}/projects`);

      const getPlugins = getAllPluginsProjects.data.filter(item=>item.name.search("plugin") !== -1);

      _each(getPlugins, function(plugin){
        const pluginItem = {
          name: plugin.name,
          description: '[Plugin] '.bold + plugin.name.red + ' ' + `- [ ${plugin.description} ]`.yellow
        };

        results.push(pluginItem);
      });
    }

  }else if(pluginSourceGit === "github"){

    const getAllPluginsProjects = await generateGitHubRequestApi("get", `orgs/${pluginSourceGroup}/repos`);

    if(getAllPluginsProjects && _size(getAllPluginsProjects)){

      const getPlugins = getAllPluginsProjects.data.filter(item=>
        item.name.search("plugin") !== -1 && item.name !== "xcli-plugin-template"
      );

      _each(getPlugins, function(plugin){
        const pluginItem = {
          name: plugin.name,
          description: '[Plugin] '.bold + plugin.name.red.bold + ' ' + `- [ ${plugin.description} ]`.yellow
        };

        results.push(pluginItem);
      });
    }

  }

  return results;
};
