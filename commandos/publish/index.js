const { prompt } = require('enquirer');
const { isFunction, keys } = require('lodash');
const { info, error } = require('../../core/utils/std');
const { packageJSON } = require('../../core/utils/abc');
const COMMON = require('../../dict/commandos/COMMON');
const PUBLISH = require('../../dict/commandos/PUBLISH');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const publishCommand = async function(command){
  const prefixAbcJSON = checkAbcJSONFormat();

  if(prefixAbcJSON){
    const isDebugMode = command ? !!command.debug : false;
    const publish = getTargetEntryJS(prefixAbcJSON.type, "publish.js");

    if(publish && !isDebugMode) packageAutoInstall();

    if(isFunction(publish)){
      const publishOptions = prefixAbcJSON.publish;
      const choices = keys(publishOptions);

      if(choices.length){
        const { entry } = await prompt({
          type: "select",
          name: "entry",
          message: PUBLISH.CHOICE_PUBLISH_ENTRY_MESSAGE,
          choices
        });

        const presetMsg = `${'[xcli]'.bold} ${('['+prefixAbcJSON.type+']').red.bold} ${('['+packageJSON.name+']').green.bold} `;
        info(`${presetMsg}${"prepare publish".green}`);
        return publish(createContext({ publishOptions: publishOptions[entry], publishEntry: entry }), [isDebugMode]);
      }

      return error(PUBLISH.PUBLISH_OPTIONS_REQUIRED);
    }

    return error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"publish".bold}`);
  }
};

module.exports = publishCommand;
