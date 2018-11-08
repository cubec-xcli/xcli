const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const {exec, execSync} = require('child_process');

const {preinstall, printCommanLog, abcJSON, paths} = util;
const {log, error} = util.msg;

module.exports = function() {
  if (abcJSON) {
    const type = abcJSON.type;
    const output = `${paths.currentPath}/${abcJSON.path.output}`;

    printCommanLog();

    preinstall();

    if (fs.existsSync(output)){
      fse.removeSync(output);
    };

    const webpack = require('webpack');
    const webpackConfig = require(path.join(
      __dirname,
      `../packages/${type}/webpack.build`,
    ));

    const compiler = webpack(webpackConfig);

    compiler.run(() => log('building completed!'));
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
