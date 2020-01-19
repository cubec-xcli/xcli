const axios = require('axios');
const cache = require('../../utils/cache');
const getAotPluginSource = require('./getAotPluginSource');

const { pluginSourceGitPath } = getAotPluginSource();

const createAPIAddress = function(apiName){
  return `https://api.${pluginSourceGitPath}/${apiName}`;
};

module.exports = function(requestType, apiName, params={}){
  const token = cache.getGlobal("githubToken");

  const axiosHeaders = {
    "Accept": "application/vnd.github.inertia-preview+json",
    "Authorization": "token " + token,
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
