const colors = require('colors');
const { isFunction } = require('lodash');
const parseArgs = require('./parseArgs');
const createContext = require('../../../core/common/aop/createContext');
const getTargetEntryJS = require('../../../core/common/pre/getTargetEntry');
const { info, error } = require('../../../core/utils/std');
const { prefixAbcJSON, packageJSON } = require('../../../core/utils/abc');
const COMMON = require('../../../dict/commandos/COMMON');
const DEV = require('../../../dict/commandos/DEV');

const args = parseArgs(process.argv.slice(2));

(async function(){
  const devServer = await getTargetEntryJS(prefixAbcJSON.type, "devServer.js");

  if(isFunction(devServer)){
    const presetMsg = `${'[xcli]'.bold} ${('['+prefixAbcJSON.type+']').red.bold} ${('['+packageJSON.name+']').green.bold} `;
    info(presetMsg + `${"version".bold} ${packageJSON.version}`.green);
    info(presetMsg + `${DEV.INFO_DEVSERVER_PRESTART}`.green);
    devServer(createContext(), args);
  }else{
    error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"devServer".bold}`);
    throw new Error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT);
    return process.exit(0);
  }
})();

