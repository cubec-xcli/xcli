const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const glob = require('glob');
const util = require('../../lib/util');
const struct = require('ax-struct-js');
const axios = require('axios');
const {Input} = require('enquirer');
const build = require('./build');

const _size = struct.size();
const _merge = struct.merge();
const _one = struct.index("one");
const _each = struct.each();

const {abcJSON, paths} = util;
const {currentPath} = paths;
const {log, warn, error, loading} = util.msg;

function getToken(){
  if(fs.existsSync(paths.tokenPath)){
    const token = fs.readFileSync(paths.tokenPath, 'utf8');

    if(token && _size(token) > 8){
      return token;
    }
    warn("The token is not being validate");
    return false;
  }

  return false;
}

function processGitLabAPI(gitlab, api){
  return `${gitlab}/api/v4/${api}`;
}

function pathCater(basepath, usepath, targetPath){
  let exportPath = usepath.split(`${basepath}`)[1].substr(1);

  if(targetPath){
    exportPath = targetPath + (targetPath.substr(targetPath.length-1) === "/" ? "" : "/") + exportPath;
  }

  return exportPath;
}


function findInEntry(entryes, path, targetPath){
  let find = false;

  _each(entryes, function(entry){
    let isVendor = entry === "_vendors";
    if(path.match(targetPath ? `${targetPath}/${entry}/${isVendor? "/"+abcJSON.name : ""}` : entry))
      find = true;
  });

  return find;
}

function upCommitToGitLab(currentPubOption, pubkey, token){
  const { gitlab } = abcJSON.publish;
  const axiosHeaders = {
    "Private-Token": token,
    "X-Requested-With": "XMLHttpRequest"
  };

  const entryes = fs.readdirSync(`${paths.currentPath}/src`).filter(function(val){
    return val[0] == "." ? false : val;
  }).map(function(val){
    return val;
  });

  return build(entryes, pubkey, function(){

    log(`[${pubkey.yellow}] prepared for release [${entryes.toString().red}]`);

    axios({
      url: processGitLabAPI(gitlab, "projects"),
      params: { per_page: 1000, recursive: true },
      headers: axiosHeaders
    }).then((res)=>{
      // 获取到对应的ProjectId
      const project = _one(res.data, item=>item.path_with_namespace === currentPubOption.git);

      const projectId = project ? project.id : null;
      const targetPath = currentPubOption.target || "";

      if(!projectId){
        return error("publish process can not find remote host project on gitlab");
      }

      const sp = loading(`[${pubkey.yellow}] starting scan git repository tree`);

      axios({
        url: processGitLabAPI(gitlab, `projects/${projectId}/repository/tree`),
        params: _merge({ ref: currentPubOption.branch, recursive: true, per_page: 1000 }, targetPath ? { path: targetPath } : {}) ,
        headers: axiosHeaders
      }).then((res)=>{
        entryes.unshift(["_vendors"]);

        const commits = {
          branch : currentPubOption.branch,
          commit_message : `${(new Date()).toLocaleString()} branch [${currentPubOption.branch}] xcli publish commit`,
          actions: []
        };

        // 先删除对应entry中已存在的文件
        _each(res.data, function(file, index){
          //console.log(file);

          if(file.type === "blob" && findInEntry(entryes, file.path, targetPath)){
            commits.actions.unshift({
              action: "delete",
              file_path: file.path
            });
          }
        });

        sp.succeed("scan sucess and compare with commits file");

        //return console.log(commits.actions);

        // 发布entry中的文件
        log("");

        _each(entryes, function(entry){
          log(`scan entry = ${("["+entry+"]").green.bold}`);

          _each(glob.sync(`${paths.outputPath}/${entry}/*.*`), function(filepath){
            const upFilePath = pathCater(paths.outputPath, filepath, targetPath);

            log(`prepare commit file: ${filepath.split(currentPath)[1].yellow} -> ${upFilePath.red}`);

            commits.actions.push({
              action: "create",
              file_path: upFilePath,
              content: fs.readFileSync(filepath, 'utf8')
            });
          });
        });

        const sp2 = loading("push commits merge to remote respository...");

        axios({
          method: 'post',
          url: processGitLabAPI(gitlab, `projects/${projectId}/repository/commits`),
          headers: _merge(axiosHeaders, { "Content-Type": "application/json" }),
          data: commits
        }).then((res)=>{
          if(res && res.data){
            if(res.data.id && res.data.message){
              sp2.succeed("push commits success");
              log(`publish upcommit success to gitlab: ${currentPubOption.git}`.green);
              fse.removeSync(paths.outputPath);
            }else{
              sp2.fail("push throw error");
              error(res);
              error(`publish upcommit fails with gitlab: ${currentPubOption.git}`);
              fse.removeSync(paths.outputPath);
            }
            process.exit();
          }
        },(res)=>{
          sp2.fail("catch request throw error");
          error(res);
          fse.removeSync(paths.outputPath);
        });

      });

    });
  });
}

module.exports = function(currentPubOption, pubkey){
  const token = getToken();

  if(token) return upCommitToGitLab(currentPubOption, pubkey, token);

  return new Input({
    message: "GitLab Personal access tokens",
  }).run().then(token=>{
    fse.ensureFileSync(paths.tokenPath);
    fs.writeFileSync(paths.tokenPath, token, 'utf8');
    upCommitToGitLab(currentPubOption, pubkey, token);
  }).catch(console.error);
};
