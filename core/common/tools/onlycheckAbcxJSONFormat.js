const struct = require('ax-struct-js');
const { merge, isPlainObject, isString } = require('lodash');
const defaultAbcxJSON = require('../../../config/defaultAbcxJSON');
const { error } = require('../../utils/std');
const ERRORS = require('../../../dict/std/ERRORS');

const size = struct.size();

module.exports = function(abcxJSON){
  if(!isPlainObject(abcxJSON))
    return error(ERRORS.ABCJSON.X_NOTAS_JSONFORMAT);

  if(!size(abcxJSON))
    return error(ERRORS.ABCJSON.X_NOT_EMPTY);

  if(
    !abcxJSON["plugin-name"] ||
    !isString(abcxJSON["plugin-name"]) ||
    abcxJSON["plugin-name"].length < 2 ||
    !abcxJSON["plugin-version"]
  )
    return error(ERRORS.ABCJSON.X_NOT_PASSCHECK);

  return merge({}, defaultAbcxJSON, abcxJSON);
};
