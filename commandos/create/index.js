const path = require('path');

const paths = require('../../core/utils/paths');
const { info, warn } = require('../../core/utils/std');
const { prefixAbcJSON } = require('../../core/utils/abc');
const checkAbcJsonFormat = require('../../core/common/pre/checkAbcJSONFormat');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const callCreate = require('./adapter/callCreate');

const CREATE = require('../../dict/commandos/CREATE');

// create command
const createCommand = async function(projectName){
  if(checkAbcJsonFormat()){
    const initProjectPath = path.resolve(paths.currentPath, projectName||"");
    const create = getTargetEntryJS(prefixAbcJSON.type, "create.js");

    //存在对应的实现
    const createCompleted = await callCreate(create, projectName, initProjectPath);

    if(createCompleted) return info("create template select completed");

    return warn("create template select failed");
  }

  return warn(CREATE.ERROR_WITHOUT_FIND_TEMPLATE);
};

module.exports = createCommand;
