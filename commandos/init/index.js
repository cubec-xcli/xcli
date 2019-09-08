const fs = require('fs');
const path = require('path');
const { keys, isPlainObject, isFunction, isString } = require('lodash');
const { prompt } = require('enquirer');

const paths = require('../../core/utils/paths');
const { error } = require('../../core/utils/std');
const { prefixAbcJSON } = require('../../core/utils/abc');
const checkAbcJsonFormat = require('../../core/common/pre/checkAbcJSONFormat');
const createContext = require('../../core/common/aop/createContext');

const INIT = require('../../dict/commandos/INIT');

const makeSelecter = function(selectObject){
  return prompt({
    type: 'select',
    name: 'template',
    message: INIT.SELECT_TEMPLATE_TITLE,
    choices: keys(selectObject)
  });
};

const getFinallyActions = async function(template){
  const choice = await makeSelecter(template);
  const result = template[choice.template];

  if(isPlainObject(result)) return getFinallyActions(result);
  return result;
};

// 命令出口
const initCommand = async function(projectName){
  const initProjectPath = `${paths.currentPath}${projectName ? ('/'+projectName) : ''}`;

  // 优先使用脚本的包
  let templatePath = !prefixAbcJSON ? path.resolve(paths.cliRootPath, 'core/templates/index.js') :
    (checkAbcJsonFormat() ? path.resolve(paths.cliRootPath, `builtinplugins/${prefixAbcJSON.type}/init.js`) : '');

  if(!fs.existsSync(templatePath)){
    // 如果脚本包不存在，则尝试寻找xcli内置的包 [/core/packages]
    const findBuiltinPackage = path.resolve(paths.cliRootPath, `plugins/${prefixAbcJSON.type}/init.js`);
    // 如果找到了对于init的实现，则使用该实现
    if(fs.existsSync(findBuiltinPackage))
      templatePath = findBuiltinPackage;
    else
      templatePath = false;
  }

  // 必须存在模板配置
  if(templatePath){
    const template = require(templatePath);
    const action = await getFinallyActions(template);

    if(isString(action)){
      const gitRepoUrl = action;
      const download = require(path.resolve(paths.cliRootPath, 'commandos/init/adapter/download.js'));
      return download(gitRepoUrl, projectName, initProjectPath);
    }else if(isFunction(action)){
      return action(createContext({
        projectName,
        projectRoot: paths.currentPath
      }), [projectName]);
    }

    return error(INIT.ERROR_UNKNOWN_ACTION);
  }

  return error(INIT.ERROR_WITHOUT_FIND_TEMPLATE);
};

module.exports = initCommand;
