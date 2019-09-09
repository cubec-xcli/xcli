const colors = require('colors');
const { each } = require('lodash');

const prefixStdOutMsg = function(dict){
  return each(dict, function(child, mainKey){
    const key = mainKey.toUpperCase();

    each(child, function(msg, childKey){
      child[childKey.toUpperCase()] = `${("["+mainKey+"]").bold} ${msg}`;
      delete child[childKey];
    });

    dict[key] = child;

    delete dict[mainKey];
  });
};

const ERROR = {
  // abcJSON相关
  abcJSON: {
    notexist: "abc.json does not exist or it is not like JSON standard format",
    notypeorname: "abc.json must exist (type) and (name) property",
    notexistplugin: 'abc.json use plugin is not exist',
    trytoinstallplugin: 'can not find abc.json typeof plugin, try to install ',
    x_not_exist: 'plugin entry can not find ',
    x_notas_jsonformat: 'plugin abcx.json is not standard JSON format',
    x_not_empty: "plugin abcx.json can not be empty file",
    x_not_passcheck: 'plugin abcx.json is a non-compliant file or missing the necessary fields'
  },

  // cache缓存相关
  cache: {
    readcacheerror: "the cache readfile parse unexcepted error with JSON.parse"
  },

  // mockServer中间件相关
  mockServer: {
    cantmatchrule: "can't match route rule as unkown request method",
    hotupdateunexpected: "hot update source mockfile script throw unexcepted error"
  }

};

const output = prefixStdOutMsg(ERROR);

// console.log(output);
module.exports = output;
