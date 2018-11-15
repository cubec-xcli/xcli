const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const path = require('path');
const util = require('../../lib/util');
const struct = require('ax-struct-js');
const axios = require('axios');
const {prompt} = require('inquirer');

const _size = struct.size();
const _merge = struct.merge();
const _one = struct.index("one");
const _each = struct.each();

const {abcJSON, paths} = util;
const {log, warn, error} = util.msg;

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function getToken(){
  if(fs.existsSync(paths.tokenPath)){
    const token = fs.readFileSync(paths.tokenPath, 'utf8');

    if(token && _size(token) > 8){
      return token;
    }else{
      warn("The token is not being validate");
      return false;
    }
  }

  return false;
}

function processGitLabAPI(gitlab, api){
  return `${gitlab}/api/v4/${api}`;
}

function pathCater(basepath, usepath){
  return usepath.split(`${basepath}`)[1].substr(1);
}

function upCommitToGitLab(currentPubOption, token){
  const { gitlab } = abcJSON.publish;

  const axiosHeaders = {
    "Private-Token": token,
    "X-Requested-With": "XMLHttpRequest"
  };

  axios({
    url: processGitLabAPI(gitlab, "projects"),
    headers: axiosHeaders
  }).then((res)=>{
    const project = _one(res.data, (item)=>{
      return item.path_with_namespace === currentPubOption.git
    });

    const projectId = project.id;

    axios({
      url: processGitLabAPI(gitlab, `projects/${projectId}/repository/tree`),
      params: { ref: currentPubOption.branch } ,
      headers: axiosHeaders
    }).then((res)=>{
      const commits = {
        branch : currentPubOption.branch,
        commit_message : `${(new Date()).toLocaleString()} branch [${currentPubOption.branch}] xcli publish commit`,
        actions: []
      };

      const fileList = res.data;

      _each(res.data, function(file, index){
        commits.actions.push({
          action: "delete",
          file_path: file.path
        });
      });

      // 扫描目录中的文件
      walk(paths.outputPath, function(err, result){
        if(result.length < 2){
          return error("publish fail without build completed compress files in output dir");
        }

        _each(result, function(filepath){
          log(`prepare commit file: ${filepath.yellow}`);

          commits.actions.push({
            action: "create",
            file_path: pathCater(paths.outputPath, filepath),
            content: fs.readFileSync(filepath, 'utf8')
          });
        });

        axios({
          method: 'post',
          url: processGitLabAPI(gitlab, `projects/${projectId}/repository/commits`),
          headers: _merge(axiosHeaders, {
            "Content-Type": "application/json"
          }),
          data: commits
        }).then((res)=>{
          if(res && res.data){
            if(res.data.id && res.data.message){
              log(`publish upcommit success to gitlab: ${currentPubOption.git}`.green);
              fse.removeSync(paths.outputPath);
            }else{
              error(`publish upcommit fails with gitlab: ${currentPubOption.git}`);
            }
          }
        });

      });

    });
  });
}

module.exports = function(currentPubOption){
  const token = getToken();

  if(token)
    return upCommitToGitLab(currentPubOption, token);

  prompt([
    {
      type: 'input',
      name: 'token',
      message: "GitLab Personal access tokens",
      validate: function(value) {
        if(value && _size(value)>8){
          return true;
        }

        return 'Please enter a valid Personal access tokens';
      }
    }
  ]).then(({ token }) => {
    fse.ensureFileSync(paths.tokenPath);
    fs.writeFileSync(paths.tokenPath, token, 'utf8');
    upCommitToGitLab(currentPubOption, token);
  });
};
