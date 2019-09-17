const colors = require('colors');
const { execSync } = require('child_process');

const info = require('../../utils/std/info');
const { prefixAbcJSON } = require('../../utils/abc');

const packageAutoInstall = function(options) {
  const packageType = prefixAbcJSON ? (prefixAbcJSON.package || "npm") : "npm";

  info(`${"[PKG]".bold} ${packageType.bold} installing...`);

  // yarn 的模式下，包不会以production的模式安装
  execSync(`${packageType} install${packageType === "yarn" ? " --production=false" : ""}`, options);
  // execSync(`${packageType} install`, options);

  info(`${"[PKG]".bold} ${packageType.bold} install completed!`);
};

module.exports = packageAutoInstall;
