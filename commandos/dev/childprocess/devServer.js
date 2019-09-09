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
const devServer = getTargetEntryJS(prefixAbcJSON.type, "devServer.js");

if(isFunction(devServer)){
  info(`${('['+prefixAbcJSON.type+']').bold} [${packageJSON.name}] version ${packageJSON.version}`);
  info(`${('['+prefixAbcJSON.type+']').bold} [${packageJSON.name}] ${DEV.INFO_DEVSERVER_PRESTART}`);
  devServer(createContext(), args);
}else{
  error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"devServer".bold}`);
  throw new Error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT);
  process.exit(0);
}
