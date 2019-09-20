const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const { isFunction } = require('lodash');
const { packageJSON } = require('../../core/utils/abc');
const paths = require('../../core/utils/paths');
const { error, info } = require('../../core/utils/std');
const COMMON = require('../../dict/commandos/COMMON');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const buildCommand = async function(command){
  const prefixAbcJSON = checkAbcJSONFormat();

  if(prefixAbcJSON){
    const isDebugMode = command ? !!command.debug : false;
    const builder = getTargetEntryJS(prefixAbcJSON.type, "build.js");
    const existsOutputDir = fs.existsSync(paths.currentOutputPath);

    if(existsOutputDir) await fse.remove(paths.currentOutputPath);

    if(builder && !isDebugMode) packageAutoInstall();

    if(isFunction(builder)){
      const presetMsg = `${'[xcli]'.bold} ${('['+prefixAbcJSON.type+']').red.bold} ${('['+packageJSON.name+']').green.bold} `;
      info(`${presetMsg}${"prepare building".green}`);
      return builder(createContext(), [isDebugMode]);
    }

    return error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"build".bold}`);
  }
};

module.exports = buildCommand;
