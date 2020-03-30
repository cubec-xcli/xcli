const path = require('path');

const paths = require('../../core/utils/paths');
const struct = require('ax-struct-js');
const { info, warn } = require('../../core/utils/std');
const { prefixAbcJSON } = require('../../core/utils/abc');
const checkAbcJsonFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const createContext = require('../../core/common/aop/createContext');
const callCreate = require('./adapter/callCreate');
const { isFunction, isPlainObject } = require('lodash');

const CREATE = require('../../dict/commandos/CREATE');
const size = struct.size();

// create command
const createCommand = async function(projectName){
  if(checkAbcJsonFormat()){
    const initProjectPath = path.resolve(paths.currentPath, projectName||"");
    let create = await getTargetEntryJS(prefixAbcJSON.type, "create.js");

    if(isFunction(create))
      create = create(createContext(), []);

    if(create != null &&
      isPlainObject(create) &&
      size(create)){

      //存在对应的实现
      const createCompleted = await callCreate(create, projectName, initProjectPath);

      if(createCompleted) info("create template selected completed");

      return;
    }

    return warn("create template selected failed, invalid create action");
  }

  return warn(CREATE.ERROR_WITHOUT_FIND_TEMPLATE);
};

module.exports = createCommand;
