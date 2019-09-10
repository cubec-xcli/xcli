const fs = require('fs');
const path = require('path');
const prefix = require('./prefix');

const currentPath = process.cwd();

// abcJSON 所在的路径
const abcJSONPath = `${currentPath}/abc.json`;

// packageJSON 所在的路径
const packageJSONPath = `${currentPath}/package.json`;

// 获取abc.json
const abcJSON = fs.existsSync(abcJSONPath) ? require(abcJSONPath) : null;

// 获取package.json
const packageJSON = fs.existsSync(packageJSONPath) ? require(packageJSONPath) : {};

// 获取 xcli的packageJSON
const xcliPackageJSONPath = path.resolve(__dirname, "../../../package.json");

const xcliPackageJSON = fs.existsSync(xcliPackageJSONPath) ? require(xcliPackageJSONPath) : {};

// 导出abcJSON
module.exports = {
  abcJSON,
  packageJSON,
  xcliPackageJSON,
  prefixAbcJSON: prefix(abcJSON)
};
