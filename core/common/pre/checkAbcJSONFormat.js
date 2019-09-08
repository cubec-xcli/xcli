const colors = require('colors');
const { isPlainObject } = require('lodash');
const ERRORS = require('../../../dict/std/ERRORS');

const err = require('../../utils/std/error');
const { abcJSON } = require('../../utils/abc');

const checkAbcJsonFormat = function(){

  if(!isPlainObject(abcJSON))
    return err(ERRORS.ABCJSON.NOTEXIST);

  if(!abcJSON.type || !abcJSON.name)
    return err(ERRORS.ABCJSON.NOTYPEORNAME);

  return true;
};

module.exports = checkAbcJsonFormat;
