const fs = require('fs');
const path = require('path');
const paths = require('../../utils/paths');
const colors = require('colors');
const { warn } = require('../../utils/std');
const checkPluginAbcxJSONFormat = require('./checkPluginAbcxJSONFormat');
// 获取包的入口AOP文件
const getTargetEntryJS = function(type, entryFileName){
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
  } else {
    // 如果没有则尝试寻找内置的包
    const builtinPath = path.resolve(paths.cliRootPath, `builtinplugins/${type}`);

    filePath = `${builtinPath}/${entryFileName}`;

    // 如果内置包也没有，则提示是否需要安装对应的plugin
    if(!fs.existsSync(filePath)){
      if(!fs.existsSync(builtinPath))
        warn(`can not find type mode [${type.bold}], maybe try to install "${type}" plugin`);
      filePath = false;
    }
  }

  if(filePath) target = require(filePath);

  return target;
};

module.exports = getTargetEntryJS;
