const colors = require('colors');
const struct = require('ax-struct-js');
const bs = require('browser-sync');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { isFunction } = require('lodash');
// const { ip } = require('../../core/utils/os');
const { prompt } = require('enquirer');
const paths = require('../../core/utils/paths');
const { error } = require('../../core/utils/std');
const { mockServer } = require('../../core/servers');
const COMMON = require('../../dict/commandos/COMMON');

const cool = struct.cool();
const keys = struct.keys();

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const testCommand = async function(command){
  const prefixAbcJSON = checkAbcJSONFormat();

  if(prefixAbcJSON){
    const isUnitMode = command ? !!command.unit : false;
    const builder = await getTargetEntryJS(prefixAbcJSON.type, "build.js");
    const buildOptions = keys(prefixAbcJSON.define);
    let buildEntry = "";

    if(builder && !isUnitMode) packageAutoInstall();

    const { entry } = await prompt({
      type: "select",
      name: "entry",
      message: "Choice resource build environment",
      choices: buildOptions
    });
    buildEntry = entry;

    if(isFunction(builder))
      return builder(createContext({ buildEntry }), [], function(){
        const previewBS = bs.create();
        const proxyConfig = prefixAbcJSON.devServer.proxy;
        const proxyMiddlewares = keys(proxyConfig).map(uri=>createProxyMiddleware(uri, proxyConfig[uri]));

        return previewBS.init({
          // host: ip,
          port: prefixAbcJSON.devServer.port + 2,
          ui: {
            port: prefixAbcJSON.devServer.port + 3,
            weinre: {
              port: prefixAbcJSON.devServer.port + 4
            }
          },

          open: "ui",

          cors: true,
          // single: true,
          cwd: paths.currentPath,

          server: {
            baseDir: prefixAbcJSON.path.output,
            // index: "index.html",
            // directory: true,
            serveStaticOptions: {
              extensions: ['html']
            }
          },
          // httpModule: 'http2',
          https: prefixAbcJSON.devServer.https,
          // https: true,
          middleware: [
            ...proxyMiddlewares,
            mockServer(prefixAbcJSON.mockServer)
          ].filter(cool)
        });

      });

    return error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"build".bold}`);
  }
};

module.exports = testCommand;
