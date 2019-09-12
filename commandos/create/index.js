const fs = require('fs');
const path = require('path');
const { keys, isPlainObject, isFunction, isString } = require('lodash');
const { prompt } = require('enquirer');

const paths = require('../../core/utils/paths');
const { error, warn } = require('../../core/utils/std');
const { prefixAbcJSON } = require('../../core/utils/abc');
const checkAbcJsonFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');

const CREATE = require('../../dict/commandos/CREATE');

const makeSelecter = function(selectObject){
  return prompt({
    type: 'select',
    name: 'template',
    message: CREATE.SELECT_TEMPLATE_TITLE,
    choices: keys(selectObject)
  });
};

const getFinallyActions = async function(template){
  const choice = await makeSelecter(template);
  const result = template[choice.template];
  if(isPlainObject(result)) return getFinallyActions(result);
  return result;
};

// create command
const createCommand = async function(projectName){
  if(checkAbcJsonFormat()){
    const initProjectPath = path.resolve(paths.currentPath, projectName||"");
    const create = getTargetEntryJS(prefixAbcJSON.type, "create.js");

    //存在对应的实现
    if(create){
      const action = await getFinallyActions(create);

      if(isString(action)){
        const gitRepoUrl = action;
        const download = require(path.resolve(paths.cliRootPath, 'commandos/init/adapter/download.js'));
        return download(gitRepoUrl, projectName, initProjectPath);
      }else if(isFunction(action)){
        return action(createContext({
          projectName,
          projectRoot: paths.currentPath,
          createPath: initProjectPath
        }), [projectName]);
      }

      return error(CREATE.ERROR_UNKNOWN_ACTION);
    }
  }

  return warn(CREATE.ERROR_WITHOUT_FIND_TEMPLATE);
};

module.exports = createCommand;
