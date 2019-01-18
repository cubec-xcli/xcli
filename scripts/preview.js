const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');

const {preinstall, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function() {
  if (abcJSON) {
    const type = abcJSON.type;
    const output = `${paths.currentPath}/${abcJSON.path.output}`;
    const browserSync = require('browser-sync');
    const browserSyncConfig = require('../config/browserSync');

    // printCommanLog();

    preinstall();

    if(fs.existsSync(path.join(__dirname, `../packages/${type}/webpack.build.js`))){
      const webpack = require('webpack');
      const webpackConfig = require(path.join(
        __dirname,
        `../packages/${type}/webpack.build`,
      ));

      const compiler = webpack(webpackConfig);

      if (fs.existsSync(output)){
        log(`webpack remove prevs exist output directory. ${output.red}`);
        fse.removeSync(output);
      }

      compiler.run(() =>{ 
        log('building completed!'.blue);
        log('start BrowserSync preview server: \n'.blue);
  
        browserSync.init(browserSyncConfig);
      });
    }else{
      // 自定义发布方法
      const customBuildServer = require(path.join(
        __dirname,
        `../packages/${type}/build`,
      ));

      return customBuildServer(function(){
        log('building completed!'.blue);
        log('start BrowserSync preview server: \n'.blue);
  
        browserSync.init(browserSyncConfig);
      });
    }

  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
