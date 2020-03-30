const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const { isFunction, keys } = require('lodash');
const { error } = require('../../core/utils/std');
const COMMON = require('../../dict/commandos/COMMON');
const PUBLISH = require('../../dict/commandos/PUBLISH');

const packageAutoInstall = require('../../core/common/pre/packageAutoInstall');
const checkAbcJSONFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const _get = struct.prop("get");

const publishOptionsRecursive = async function(publishOptions, recursiveNum=1, parentPath=[]){
  let options = parentPath.length ? _get(publishOptions, parentPath.join(".")) : publishOptions;
  // 存在递归次数
  if(recursiveNum){
    // 读出选项
    const choices = keys(options);
    const { entry } = await prompt({
      type: "select",
      name: "entry",
      message: PUBLISH.CHOICE_PUBLISH_ENTRY_MESSAGE,
      choices
    });
    parentPath.push(entry);

    let [newOptions, newParentPath] = await publishOptionsRecursive(publishOptions, recursiveNum-1, parentPath);

    return [newOptions, newParentPath];
  }

  return [options, parentPath];
};

const publishCommand = async function(mode, command){
  const prefixAbcJSON = checkAbcJSONFormat();

  if(prefixAbcJSON){
    const isDebugMode = command ? !!command.debug : false;
    const publish = await getTargetEntryJS(prefixAbcJSON.type, "publish.js");

    if(publish && !isDebugMode) packageAutoInstall();

    if(isFunction(publish)){
      const publishOptions = prefixAbcJSON.publish;
      let options;
      let entryPath;

      if(mode && _get(publishOptions, mode) && mode.split(".").length === prefixAbcJSON.publishRecursive){
        options = _get(publishOptions, mode);
        entryPath = mode.split(".");
      }else{
        [options, entryPath] = await publishOptionsRecursive(publishOptions, prefixAbcJSON.publishRecursive, []);
      }

      if(options && entryPath)
        return publish(createContext({ publishOptions: options, publishEntry: entryPath.join(".") }), [isDebugMode]);

      return error(PUBLISH.PUBLISH_OPTIONS_REQUIRED);
    }

    return error(COMMON.ERROR_CANNOT_FIND_AOPSCRIPT_IMPLEMENT+` ${"publish".bold}`);
  }
};

module.exports = publishCommand;
