const fs = require('fs');
const fse = require('fs-extra');
const util = require('util');
const colors = require('colors');
const { execSync } = require('child_process');
const path = require('path');
const { prompt } = require('enquirer');
const paths = require('../../../core/utils/paths');
const { warn, loading, error } = require('../../../core/utils/std');
const checkPluginAbcxJSONFormat = require('../../../core/common/pre/checkPluginAbcxJSONFormat');
const downloadPlugin = require('./adapter/downloadPlugin');

// Install Plugin
module.exports = async function(pluginName, forceReinstall=false){
  let plugin = pluginName;
  const pluginsDir = path.resolve(paths.cliRootPath, 'plugins');

  if(!plugin){
    const { newPlugin } = await prompt({
      type: "Input",
      name: "newPlugin",
      message: "Input plugin name for remote install"
    });
    plugin = newPlugin;
    if(!plugin) return warn(`[plugin] ${plugin.bold} install interrupted`);
  }

  const newPluginPath = path.resolve(pluginsDir, plugin);
  const existPluginPath = fs.existsSync(newPluginPath);

  if(existPluginPath && !forceReinstall){
    const newPluginPathstats = fs.lstatSync(newPluginPath);

    if(!newPluginPathstats.isSymbolicLink()){
      const { forceInstall } = await prompt({
        type: "confirm",
        name: "forceInstall",
        message: `plugin ${plugin.red.bold} already exists, should force reinstall?`
      });

      if(!forceInstall) return warn(`[plugin] ${plugin.bold} install interrupted`);
    }
  }

  // 安装之前先不能移除之前的插件
  // 因为如果安装不成功，则无法回退
  // 因此先需要将plugin下载到temp文件夹中
  // 确认下载成功, 且校验插件无误之后。才可以替换先前的文件夹
  const loading_download = loading(`download remote plugin ${("["+plugin+"]").bold}`);
  const createTempDir = path.resolve(pluginsDir, '__temp');
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
      loading_download.succeed(`success download remote plugin ${("["+plugin+"]").green.bold}`);

      // 移除先前存在的插件包 可能是link的
      if(existPluginPath){
        const newPluginPathstats = fs.lstatSync(newPluginPath);
        const fsunlink = util.promisify(fs.unlink);
        if(newPluginPathstats.isSymbolicLink()) await fsunlink(newPluginPath);
        else await fse.remove(newPluginPath);
      }

      // 自动为插件安装好对应的package包
      const packageType = abcxJSON["plugin-package"] || "npm";
      const loading_plugininit = loading(`plugin init process install ${packageType.bold.red} packages`);

      execSync(`${packageType} install`, { cwd:createTempDir });

      // 安装文成之后移动文件即可
      await fse.move(createTempDir, newPluginPath);
      loading_plugininit.succeed(`success install remote plugin ${("["+plugin+"]").green.bold}`);

    }else{

      await fse.remove(createTempDir);
      loading_download.fail(`failed download remote plugin ${("["+plugin+"]").green.bold}`);
      error("the plugin is not xcli plugin format, can not be install!");
    }

  }else{
    await fse.remove(createTempDir);
    loading_download.fail(`failed download remote plugin ${("["+plugin+"]").green.bold}`);
  }

  return downloadStatus === true;
};
