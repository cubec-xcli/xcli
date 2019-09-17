const fs = require('fs');
const fse = require('fs-extra');
const util = require('util');
const colors = require('colors');
const { isFunction } = require('lodash');
const paths = require('../../core/utils/paths');
const { error } = require('../../core/utils/std');
const COMMON = require('../../dict/commandos/COMMON');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const buildCommand = async function(command){
  const prefixAbcJSON = checkAbcJSONFormat();

  if(prefixAbcJSON){
    const fsexists = util.promisify(fs.exists);
    const isDebugMode = command ? !!command.debug : false;
    const builder = getTargetEntryJS(prefixAbcJSON.type, "build.js");
    const existsOutputDir = await fsexists(paths.currentOutputPath);

    if(existsOutputDir) await fse.remove(paths.currentOutputPath);

    if(builder && !isDebugMode) packageAutoInstall();

    if(isFunction(builder))
      return builder(createContext(), [isDebugMode]);

    return error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"build".bold}`);
  }
};

module.exports = buildCommand;
