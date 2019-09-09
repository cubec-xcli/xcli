const path = require('path');
const { prefixAbcJSON } = require('../abc');

// 当前执行命令的路径 cwd
const currentPath = process.cwd();
// 当前执行命令的目录名称
const currentDirName = path.basename(currentPath);
// 资源输出目录
const currentOutputPath = path.resolve(currentPath, prefixAbcJSON ? prefixAbcJSON.path.output : "");
// 资源公共路径
const currentPublicPath = path.resolve(currentPath, prefixAbcJSON ? prefixAbcJSON.path.public : "");

// XCLI 目录的位置
const cliRootPath = path.resolve(__dirname, "../../../");
// 缓存文件 的位置
const cacheFilePath = path.resolve(cliRootPath, '.cache');
// plugins 目录的位置
const pluginsPath = path.resolve(cliRootPath, 'plugins');
const pluginsBuiltinPath = path.resolve(cliRootPath, 'builtinplugins');

const paths = {
  currentPath,
  currentDirName,
  currentOutputPath,
  currentPublicPath,

  cliRootPath,
  cacheFilePath,
  pluginsPath,
  pluginsBuiltinPath,
};

module.exports = paths;
