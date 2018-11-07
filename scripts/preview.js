const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const {exec, execSync} = require('child_process');

const {preinstall, printCommanLog, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function() {
  if (abcJSON) {
    const type = abcJSON.type;
    const output = path.resolve(paths.currentPath,abcJSON.path.output);

    printCommanLog();

    preinstall();

    if (fs.existsSync(output)){
      fse.removeSync(output);
    };

    const browserSync = require('browser-sync');
    const browserSyncConfig = require('../config/browserSync');
    const webpack = require('webpack');
    const webpackConfig = require(path.join(
      __dirname,
      `../packages/${type}/webpack.build`,
    ));

    const compiler = webpack(webpackConfig);

    compiler.run(() => {
      log('building completed!'.blue);
      log('start BrowserSync preview server: \n'.blue);

      browserSync.init(browserSyncConfig);
    });
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
