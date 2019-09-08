const fs = require('fs');
const path = require('path');
const paths = require('../../utils/paths');
const colors = require('colors');
const { warn } = require('../../utils/std');

// 获取包的入口AOP文件
const getTargetEntryJS = function(type, entryFileName){
  let target = null;
  // 优先第三方包的入口文件
  let filePath = path.resolve(paths.cliRootPath, `plugins/${type}/${entryFileName}`);

  if(!fs.existsSync(filePath)){
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
