const fs = require('fs');
const colors = require('colors');
const path = require('path');
const util = require('../../lib/util');
const CONSTANT = require('../../lib/constant');
const opn = require('opn');
const os = require('os');

const {paths, abcJSON} = util;
const {log} = util.msg;

const type = abcJSON.type;
const port = +abcJSON.devServer.port || 9001;

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

if(fs.existsSync(path.join(__dirname, `../../packages/${type}/webpack.devServer.js`))){
  const webpackConfig = require(path.join(
    __dirname,
    `../../packages/${type}/webpack.devServer`,
  ));
  const compiler = webpack(webpackConfig);
  const server = new webpackDevServer(compiler, webpackConfig.devServer);

  log(`Webpack DevServer Host on ${`${paths.ipadress}:${port}`.red}`.green);

  server.listen(port, "0.0.0.0", () => {
    log('------------------------------');
    log('Webpack DevServer Start!'.green);

    opn(`${abcJSON.devServer.https ? 'https' : 'http'}://${paths.ipadress}:${port}`, {
      app: CONSTANT.BROWSER_SYSTEM_MAPPING[os.type()],
    });
  });
}else{
  // 自定义开发工具
  const customDevServer = require(path.join(
    __dirname,
    `../../packages/${type}/devServer`,
  ));

  return customDevServer(util);
}
