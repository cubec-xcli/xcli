const colors = require('colors');
const { isFunction } = require('lodash');
const { error } = require('../../core/utils/std');
const COMMON = require('../../dict/commandos/COMMON');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const buildCommand = function(command){
  const prefixAbcJSON = checkAbcJSONFormat();

  if(prefixAbcJSON){
    const isDebugMode = command ? !!command.debug : false;
    const builder = getTargetEntryJS(prefixAbcJSON.type, "build.js");

    if(builder && !isDebugMode) packageAutoInstall();

    if(isFunction(builder))
      return builder(createContext(), [isDebugMode]);

    return error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"build".bold}`);
  }
};

module.exports = buildCommand;
