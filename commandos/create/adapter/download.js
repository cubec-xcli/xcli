const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const { prompt } = require('enquirer');
const download = require('download-git-repo');

const CREATE = require('../../../dict/commandos/CREATE');
const { loading, warn } = require('../../../core/utils/std');

const downloadRemoteGitRepo = function(gitRepoUrl, path){
  const processLoading = loading(CREATE.LOADING_PREPARE_DOWNLOAD);

  return download(gitRepoUrl, path, err => {
    if(err){
      processLoading.fail(CREATE.ERROR_FAIL_DOWNLOAD_FORM_REMOTE);
      throw err;
    }else{
      processLoading.succeed(CREATE.INFO_SUCCESS_DOWNLOAD_FORM_REMOTE);
    }
  });
};

// 实现下载远程git仓库
const gitDownloadAdapter = async function(gitRepoUrl, projectName, initProjectPath){

  let hasUnexpected = false;
  let needClear = false;

  if(projectName && fs.existsSync(initProjectPath)){
    hasUnexpected = true;
    const confirm = await prompt({
      type: 'confirm',
      name: 'clear',
      message: `The project folder ${("["+projectName+"] already exists").red.bold}! force clear empty and do init action??`
    });

    needClear = confirm.clear;
  }else if(!projectName && fs.readdirSync(initProjectPath).length){
    hasUnexpected = true;
    const confirm = await prompt({
      type: 'confirm',
      name: 'clear',
      message: `The project init ${'folder is not empty'.red.bold}! need force clear empty and do init action??`
    });
    needClear = confirm.clear;
  }

  if(hasUnexpected && needClear)
    fse.removeSync(initProjectPath);

  if((hasUnexpected && needClear) || !hasUnexpected){
    return projectName ?
      fse.ensureDir(initProjectPath, ()=>downloadRemoteGitRepo(gitRepoUrl, initProjectPath)) :
      downloadRemoteGitRepo(gitRepoUrl, initProjectPath);
  }

  return warn(CREATE.WARN_INIT_ACTION_CANCEL);
};

module.exports = gitDownloadAdapter;
