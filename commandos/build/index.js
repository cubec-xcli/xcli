const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const { isFunction } = require('lodash');
const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const { packageJSON } = require('../../core/utils/abc');
const paths = require('../../core/utils/paths');
const { error, info } = require('../../core/utils/std');
const COMMON = require('../../dict/commandos/COMMON');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const _keys = struct.keys();
const _has = struct.has();

const buildCommand = async function(mode, command){
  const prefixAbcJSON = checkAbcJSONFormat();

  if(prefixAbcJSON){
    let buildEntry = mode;
    const isDebugMode = command ? !!command.debug : false;
    const builder = await getTargetEntryJS(prefixAbcJSON.type, "build.js");
    const existsOutputDir = fs.existsSync(paths.currentOutputPath);
    const buildOptions = _keys(prefixAbcJSON.define);

    if(buildOptions.length && !_has(buildOptions, buildEntry)){
      const { entry } = await prompt({
        type: "select",
        name: "entry",
        message: "Choice build environment",
        choices: buildOptions
      });
      buildEntry = entry;
    }

    if(existsOutputDir)
      await fse.remove(paths.currentOutputPath);

    if(builder && !isDebugMode)
      packageAutoInstall();

    if(isFunction(builder)){
      const presetMsg = `${'[xcli]'.bold} ${('['+prefixAbcJSON.type+']').red.bold} ${('['+packageJSON.name+']').green.bold} `;
      info(`${presetMsg}${"prepare building".green}`);
      return builder(createContext({ buildEntry }), [isDebugMode]);
    }

    return error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"build".bold}`);
  }
};

module.exports = buildCommand;
