const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const struct = require('ax-struct-js');
const {Select} = require('enquirer');

const _isString = struct.type("string");
const _isFn = struct.type('func');
const _keys = struct.keys();
const _size = struct.size();

const {preinstall, abcJSON, paths} = util;
const {log, error} = util.msg;

module.exports = function() {
  if (abcJSON) {

    if(abcJSON.publish || !_size(abcJSON.publish)){

      if(_isString(abcJSON.publish)){
        const type = abcJSON.type;
        const publisher = require(abcJSON.publish);

        if(!_isFn(publisher)){
          return error("abc.json custom publish runner path is not a moudle exports like available function");
        }

        // printCommanLog();

        preinstall();

        if (fs.existsSync(paths.outputPath)){ fse.removeSync(paths.outputPath); };

        const webpack = require('webpack');
        const webpackConfig = require(path.join(
          __dirname,
          `../packages/${type}/webpack.build`,
        ));

        const compiler = webpack(webpackConfig);

        return compiler.run(() =>{
          log('webpack building completed!');
          log(`start custom [${type}] publish process...`);

          publisher(abcJSON);
        });
      }

      const gitlab = abcJSON.publish.gitlab;
      const pubEntrys = _keys(abcJSON.publish.options);

      if(!gitlab){
        return error(`${'abc.json'.bold} publish config missing [gitlab] url`);
      }

      if(!_size(pubEntrys)){
        return error(`${'abc.json'.bold} publish config missing [options] key entry`);
      }

      new Select({
        name: "entry",
        message: "Choice the publish option for branch entry",
        choices: pubEntrys
      }).run().then((pubkey) =>{
        const type = abcJSON.type;
        const currentPubOption = abcJSON.publish.options[pubkey];

        if(fs.existsSync(path.join(__dirname, `../packages/${type}/webpack.build.js`))){
          // printCommanLog();

          preinstall();
          
          if (fs.existsSync(paths.outputPath)){ fse.removeSync(paths.outputPath); };

          const webpack = require('webpack');
          const webpackConfig = require(path.join(
            __dirname,
            `../packages/${type}/webpack.build`,
          ));

          const compiler = webpack(webpackConfig);

          compiler.run(() =>{
            log('webpack building completed!');
            log(`start xcli[${type}] publish process...`);

            // 编译完成后，执行推送
            const publisher = require(path.join(
              __dirname,
              `../packages/${type}/publish`,
            ));

            return publisher(currentPubOption);
          });
        }else if(fs.existsSync(path.join(__dirname, `../packages/${type}/build.js`))){
          const publisher = require(path.join(
            __dirname,
            `../packages/${type}/publish`,
          ));

          return publisher(currentPubOption);
        }else{
          error(`xcli can not find [${type}] typeof publish progass`);
        }
      });

    }else{
      error(`${'abc.json'.bold} without publish config`);
    }

  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
