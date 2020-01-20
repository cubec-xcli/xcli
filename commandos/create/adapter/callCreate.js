const { keys, isPlainObject, isFunction, isString } = require('lodash');
const { prompt } = require('enquirer');
const download = require('./download');

const paths = require('../../../core/utils/paths');
const { error } = require('../../../core/utils/std');
const createContext = require('../../../core/common/aop/createContext');

const CREATE = require('../../../dict/commandos/CREATE');

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

// callCreate
const callCreate = async function(create, projectName, initProjectPath){
  if(create){
    const action = await getFinallyActions(create);

    if(isString(action)){
      const gitRepoUrl = action;
      download(gitRepoUrl, projectName, initProjectPath);

      return true;

    }else if(isFunction(action)){
      action(createContext({
        projectName,
        projectRoot: paths.currentPath,
        createPath: initProjectPath
      }), [projectName]);

      return true;
    }

    return error(CREATE.ERROR_UNKNOWN_ACTION);
  }

  return false;
};

module.exports = callCreate;
