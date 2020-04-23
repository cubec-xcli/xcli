const fs = require('fs');
const fse = require('fs-extra');
const util = require('util');
const colors = require('colors');
const struct = require('ax-struct-js');
const { execSync } = require('child_process');
const path = require('path');
const { prompt } = require('enquirer');

const paths = require('../../../core/utils/paths');
const cache = require('../../../core/utils/cache');
const { warn, loading, error } = require('../../../core/utils/std');
const checkPluginAbcxJSONFormat = require('../../../core/common/pre/checkPluginAbcxJSONFormat');
const downloadPlugin = require('./adapter/downloadPlugin');
const fetchRemotePluginsList = require('./adapter/fetchRemotePluginsList');
const getAotPluginSource = require('../../../core/common/pre/getAotPluginSource');
const { pluginSourceGit, pluginSourceGitPath, pluginSourceGroup } = getAotPluginSource();

const COMMON = require('../../../dict/commandos/COMMON');
const PLUGIN = require('../../../dict/commandos/PLUGIN');

let tempId = 0;

const _values = struct.values();
const _each = struct.each("array");
const _size = struct.size();

// Install Plugin
module.exports = async function(pluginName, forceReinstall=false){
  let plugin = pluginName;
  const pluginsDir = path.resolve(paths.cliRootPath, 'plugins');

  // 没有token则需要强制输入token
  // gitlab should get PAT
  if(pluginSourceGit === "gitlab" && !cache.getGlobal("gitlabToken")){
    const { gitlabToken } = await prompt({
      type: "input",
      name: "gitlabToken",
      message: COMMON.REQUIRED_INPUT_GITLAB_PAT
    });

    if(!gitlabToken && gitlabToken.length < 5) return warn(PLUGIN.PLUGIN_LIST_COMMAND_INTERRUPTED);

    cache.setGlobal("gitlabToken", gitlabToken);
  }


  // 没有token则需要强制输入token
  // github should get PAT
  if(pluginSourceGit === "github" && !cache.getGlobal("githubToken")){
    const { githubToken } = await prompt({
      type: "input",
      name: "githubToken",
      message: COMMON.REQUIRED_INPUT_GITHUB_PAT
    });

    if(!githubToken && githubToken.length < 5) return warn(PLUGIN.PLUGIN_LIST_COMMAND_INTERRUPTED);

    cache.setGlobal("githubToken", githubToken);
  }


  if(!plugin){
    const pluginList = await fetchRemotePluginsList();

    if(_size(pluginList)){
      const choiceMapping = {};
      const choiceList = _values(pluginList, "description");

      _each(pluginList, function(item){
        choiceMapping[item.description] = item.name;
      });

      const { pluginDesc } = await prompt({
        type: "AutoComplete",
        choices: choiceList,
        name: "pluginDesc",
        message: PLUGIN.PLUGIN_INSTALL_CHOICE_PLUGINNAME,
        required: true,
      });

      plugin = choiceMapping[pluginDesc];

    }else{
      // 要求输入插件名称
      warn("can not get remote plugin list, request input plugin name");

      const { newPlugin } = await prompt({
        type: "Input",
        name: "newPlugin",
        required: true,
        message: PLUGIN.PLUGIN_INSTALL_PLUGINNAME_REQUIRED
      });

      plugin = newPlugin;
    }
  }

  const newPluginPath = path.resolve(pluginsDir, plugin);
  const existPluginPath = fs.existsSync(newPluginPath);

  // 如果不是强制安装，则询问是否覆盖插件
  if(existPluginPath && !forceReinstall){
    const newPluginPathstats = fs.lstatSync(newPluginPath);

    if(!newPluginPathstats.isSymbolicLink()){
      const { forceInstall } = await prompt({
        type: "confirm",
        name: "forceInstall",
        message: `plugin ${("["+plugin+"]").red.bold} already exists, should force reinstall?`
      });

      if(!forceInstall) return warn(`[plugin] ${plugin.bold} install interrupted`);
    }
  }

  // 安装之前先不能移除之前的插件
  // 因为如果安装不成功，则无法回退
  // 因此先需要将plugin下载到temp文件夹中
  // 确认下载成功, 且校验插件无误之后。才可以替换先前的文件夹
  const loading_download = loading(`download remote plugin ${("["+plugin+"]").bold}`);
  const createTempDir = path.resolve(pluginsDir, `__temp${tempId++}`);

  // 先移除，然后保证temp 存在
  await fse.remove(createTempDir);
  await fse.ensureDir(createTempDir);

  const downloadStatus = await downloadPlugin(plugin, createTempDir);

  // 下载完成后。需要严格检测插件是否符合xcli的规范
  // 如果不符合，则移除下载的文件
  if(downloadStatus === true){
    // 尝试引入 并 检测abcx.json 是否符合规范
    const abcxJSON = checkPluginAbcxJSONFormat(createTempDir);

    // abcx.json 过检
    if(abcxJSON){
      const fsunlink = util.promisify(fs.unlink);
      const fswriteFile = util.promisify(fs.writeFile);
      loading_download.succeed(`success download remote plugin ${("["+plugin+"]").green.bold}`);

      // 写入plugin-source
      abcxJSON["plugin-source"] = {
        pluginSourceGit,
        pluginSourceGitPath,
        pluginSourceGroup
      };

      // 自动为插件安装好对应的package包
      const packageType = abcxJSON["plugin-package"] || "npm";
      const loading_plugininit = loading(`plugin init process install ${packageType.bold.red} packages`);

      execSync(`${packageType} install`, { cwd:createTempDir, stdio: 'inherit' });

      // 重写abcx.json
      await fswriteFile(path.resolve(createTempDir,'abcx.json'), JSON.stringify(abcxJSON, null, 2));

      // 移除先前存在的插件包 可能是link的
      if(existPluginPath){
        const newPluginPathstats = fs.lstatSync(newPluginPath);
        if(newPluginPathstats.isSymbolicLink()) await fsunlink(newPluginPath);
        else await fse.remove(newPluginPath);
      }

      // 安装文成之后移动文件即可
      await fse.move(createTempDir, newPluginPath);

      loading_plugininit.succeed(`success install remote plugin ${("["+plugin+"]").green.bold}`);

    // 不符合规范的插件包不允许执行安装
    }else{

      // 移除插件
      await fse.remove(createTempDir);

      loading_download.fail(`failed download remote plugin ${("["+plugin+"]").green.bold}`);

      error(PLUGIN.PLUGIN_INSTALL_REJECT_UN_ABCXJSON_CHECKER);
    }

  }else{
    await fse.remove(createTempDir);

    loading_download.fail(`failed download remote plugin ${("["+plugin+"]").green.bold}`);
  }

  return downloadStatus === true;
};
