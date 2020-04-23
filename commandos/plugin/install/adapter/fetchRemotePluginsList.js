const colors = require("colors");
const struct = require("ax-struct-js");
const getAotPluginSource = require('../../../../core/common/pre/getAotPluginSource');
const generateGitLabRequestApi =  require('../../../../core/common/pre/generateGitLabRequestAPI');
const generateGitHubRequestApi = require('../../../../core/common/pre/generateGitHubRequestAPI');
const { warn } = require('../../../../core/utils/std');

const { pluginSourceGit, pluginSourceGroup, pluginSourceGroupId } = getAotPluginSource();

const _one = struct.index("one");
const _each = struct.each("array");
const _size = struct.size();
const _isNumber = struct.type("number");

// 获取远程的插件列表
module.exports = async function(){
  let results = [];

  // gitlab 的获取方式
  if(pluginSourceGit === "gitlab"){
    let groupsId;

    if(!_isNumber(pluginSourceGroupId)){
      const getGroups = await generateGitLabRequestApi("get", "groups");

      const gitlabGroups = getGroups.data || [];
      const getGroupsItem = _one(gitlabGroups, item=>item.full_path===pluginSourceGroup);

      if(getGroupsItem) groupsId = getGroupsItem.id;
    }else{
      groupsId = pluginSourceGroupId;
    }

    // 获得groupsId
    if(groupsId){
      const getAllPluginsProjects = await generateGitLabRequestApi("get", `groups/${groupsId}/projects`);

      const getPlugins = getAllPluginsProjects.data.filter(item=>item.name.search("plugin") !== -1);

      _each(getPlugins, function(plugin){
        const pluginItem = {
          name: plugin.name,
          description: '[Plugin] '.bold + plugin.name.red + ' ' + `- [ ${plugin.description} ]`.yellow
        };

        results.push(pluginItem);
      });

    }else{
      warn("[xcli] [plugin] install command can not get plugin list by groupsId");
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
