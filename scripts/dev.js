const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const opn = require('opn');

const {preinstall, printCommanLog, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function(cpath, param) {
  if (abcJSON) {
    const type = abcJSON.type;
    const port = +abcJSON.devServer.port || 9001;

    printCommanLog();

    if(param != "debug" && param != "d"){
      preinstall();
    }

    const webpack = require('webpack');
    const webpackDevServer = require('webpack-dev-server');
    const webpackConfig = require(path.join(
      __dirname,
      `../packages/${type}/webpack.devServer`,
    ));

    const compiler = webpack(webpackConfig);
    const server = new webpackDevServer(compiler, webpackConfig.devServer);

    log(`Webpack DevServer Host on ${`${paths.ipadress}:${port}`.red}`.green);

    server.listen(port, paths.ipadress, () => {
      log('------------------------------');
      log('Webpack DevServer Start!'.green);

      opn(`${abcJSON.devServer.https ? 'https' : 'http'}://${paths.ipadress}:${port}`, {
        app: ['google chrome', '--incognito'],
      });
    });
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
