const fs = require('fs');
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const opn = require('opn');

const {preinstall, printCommanLog, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function(param) {

  if (abcJSON) {
    const type = abcJSON.type;
    const port = +abcJSON.devServer.port || 9001;

    // printCommanLog();

    if(!param || (param != "debug" && param != "d")){
      preinstall();
    }

    const webpack = require('webpack');
    const webpackDevServer = require('webpack-dev-server');

    if(fs.existsSync(path.join(__dirname, `../packages/${type}/webpack.devServer.js`))){
      const webpackConfig = require(path.join(
        __dirname,
        `../packages/${type}/webpack.devServer`,
      ));
      const compiler = webpack(webpackConfig);
      const server = new webpackDevServer(compiler, webpackConfig.devServer);

      log(`Webpack DevServer Host on ${`${paths.ipadress}:${port}`.red}`.green);

      server.listen(port, "0.0.0.0", () => {
        log('------------------------------');
        log('Webpack DevServer Start!'.green);

        opn(`${abcJSON.devServer.https ? 'https' : 'http'}://${paths.ipadress}:${port}`, {
          app: ['google chrome', '--incognito'],
        });
      });
    }else{
      // 自定义开发工具
      const customDevServer = require(path.join(
        __dirname,
        `../packages/${type}/devServer`,
      ));

      return customDevServer(util);
    }
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
