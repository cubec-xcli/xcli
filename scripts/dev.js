const fs = require('fs');
const colors = require('colors');
const path = require('path');
const util = require('../lib/util');
const glob = require('glob');
const opn = require('opn');
const ip = require('ip');

const {preinstall, printCommanLog, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function() {
  if (abcJSON) {
    const type = abcJSON.type;
    const port = +abcJSON.devServer.port || 9001;
    const ipads = ip.address();
    //const ipads = "localhost";

    printCommanLog();

    const webpack = require('webpack');
    const webpackDevServer = require('webpack-dev-server');

    const webpackConfig = require(path.join(
      __dirname,
      `../packages/${type}/webpack.devServer`,
    ));

    const compiler = webpack(webpackConfig);
    const server = new webpackDevServer(compiler, webpackConfig.devServer);

    log(`Webpack DevServer Host on ${`http://${ipads}:${port}`.red}`.green);

    server.listen(port, ipads, () => {
      log('------------------------------');
      log('Webpack DevServer Start!'.green);

      opn(`http://${ipads}:${port}`, {app: 'google chrome'});
    });
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
