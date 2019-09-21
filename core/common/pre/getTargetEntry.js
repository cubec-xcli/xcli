const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const paths = require('../../utils/paths');
const colors = require('colors');
const { loading, warn } = require('../../utils/std');
const checkPluginAbcxJSONFormat = require('./checkPluginAbcxJSONFormat');

// 获取包的入口AOP文件
const getTargetEntryJS = function(type, entryFileName, notWarn=false){
  // 寻找目标
  let target = null;

  // 优先第三方包的入口文件
  const pluginsPath = path.resolve(paths.pluginsPath, `${type}`);
  let filePath = path.resolve(pluginsPath, `${entryFileName}`);
  const existPlugin = fs.existsSync(pluginsPath) && fs.existsSync(filePath);

  // 如果存在第三方包插件
  // 校验abcxJSON 是否合法，如果没有且不合法，则不允许调用
  if(existPlugin){
    const abcxJSON = checkPluginAbcxJSONFormat(pluginsPath);
    if(!abcxJSON) return target;

    // 校验合法后，检测有没有安装node模块 ，如果没有则帮忙安装
    const existNodeModules =
      fs.existsSync(path.resolve(pluginsPath, 'node_modules')) ||
      fs.existsSync(path.resolve(pluginsPath, 'package-lock.json')) ||
      fs.existsSync(path.resolve(pluginsPath, 'yarn.lock'));

    if(!existNodeModules){
      const install = loading(`${"[xcli]".green.bold} prepare plugin ${("["+type+"]").red.bold}`);
      execSync(`${abcxJSON['plugin-package'] || "npm"} install`, { cwd: pluginsPath, stdio: "inherit" });
      install.succeed();
    }
  } else {
    // 如果没有则尝试寻找内置的包
    const builtinPath = path.resolve(paths.cliRootPath, `builtinplugins/${type}`);

    filePath = `${builtinPath}/${entryFileName}`;

    // 如果内置包也没有，则提示是否需要安装对应的plugin
    if(!fs.existsSync(filePath)){
      if(!fs.existsSync(builtinPath) && !notWarn)
        warn(`can not find type mode [${type.bold}], maybe try to install "${type}" plugin`);
      filePath = false;
    }else{
      // 如果存在内置包，则帮忙检测有没有安装node模块
      const existNodeModules = fs.existsSync(path.resolve(builtinPath, 'node_modules'));

      if(!existNodeModules){
        const install = loading(`${"[xcli]".green.bold} prepare plugin ${("["+type+"]").red.bold}`);
        execSync("npm install", { cwd: builtinPath, stdio: "inherit" });
        install.succeed();
      }
    }

  }

  // 获取对应的入口，执行返回
  if(filePath) target = require(filePath);

  return target;
};

module.exports = getTargetEntryJS;
