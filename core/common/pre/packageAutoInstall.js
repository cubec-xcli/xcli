const colors = require('colors');
const { execSync } = require('child_process');

const info = require('../../utils/std/info');
const { prefixAbcJSON } = require('../../utils/abc');

const packageAutoInstall = function(options) {
  const packageType = prefixAbcJSON ? (prefixAbcJSON.package || "npm") : "npm";

  info(`${packageType.bold} installing`);

  execSync(`${packageType} install`, options);

  info(`${packageType.bold} install completed!`);
};

module.exports = packageAutoInstall;
