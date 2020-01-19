const axios = require('axios');
const cache = require('../../utils/cache');
const getAotPluginSource = require('./getAotPluginSource');

const { pluginSourceGitPath } = getAotPluginSource();

const createAPIAddress = function(apiName){
  return `https://${pluginSourceGitPath}/api/v4/${apiName}`;
};

module.exports = function(requestType, apiName, params={}){
  const token = cache.getGlobal("gitlabToken");

  const axiosHeaders = {
    "Private-Token": token,
    "X-Requested-With": "XMLHttpRequest"
  };

  const createRequestObject = {
    method: requestType,
    url: createAPIAddress(apiName),
    headers: axiosHeaders,
    params: params || {}
  };

  // console.log(createRequestObject);
  // create axios requestUrl
  return axios(createRequestObject);
};
