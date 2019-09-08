const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const glob = require('glob');
const struct = require('ax-struct-js');
const axios = require('axios');
const { prompt } = require('enquirer');
const buildAOPImplement = require('./build');

const _merge = struct.merge();
const _one = struct.index("one");
const _each = struct.each();
const _trim = struct.string("trim");

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

function findInEntry(entryes, path, targetPath, abcJSONname){
  let find = false;

  _each(entryes, function(entry){
    let isVendor = entry === "_vendors";

    if(path.match(targetPath ? `${targetPath}/${entry}/${isVendor? "/"+abcJSONname : ""}` : entry))
      find = true;
  });

  return find;
}

module.exports = async function(context, args) {
  const { publishOptions, publishEntry, utils } = context;
  const { paths, std, prefixAbcJSON, cache } = utils;
  const { currentPath, currentOutputPath } = paths;
  const { log, info, error, loading } = std;
  let gitLabToken = cache.get("gitLabToken");

  if(!gitLabToken){
    const { getToken } = await prompt({
      type: "input",
      name: "getToken",
      message: "Input your gitlab private Personal Access Token: "
    });
    cache.set("gitLabToken", (gitLabToken=_trim(getToken)));
  }

  // console.log(context);
  const upCommitToGitLab = function(currentPubOption, pubkey, token) {
    const gitlab = currentPubOption.git;
    const axiosHeaders = { "Private-Token": token, "X-Requested-With": "XMLHttpRequest" };

    return buildAOPImplement(context, args, async function(entryes) {
      info(`[${pubkey.yellow}] prepared for release [${entryes.toString().red}]`);

      const allRepository = await axios({
        url: processGitLabAPI(gitlab, "projects"),
        params: { per_page: 1000, recursive: true },
        headers: axiosHeaders
      });
      const project = _one(allRepository.data,
        item => item.path_with_namespace === currentPubOption.repository);
      const projectId = project ? project.id : null;
      const targetPath = currentPubOption.target || "";

      if (!projectId) {
        return error("publish process can not find remote host project on gitlab");
      }

      const sp = loading(`[${pubkey.yellow}] starting scan git repository tree`);

      // 如果包含的话，则可以对其进行操作, 先拿出它对应的目录结构
      const getCurrentRepository = await axios({
        url: processGitLabAPI(gitlab, `projects/${projectId}/repository/tree`),
        params: _merge(
          { ref: currentPubOption.branch, recursive: true, per_page: 1000 },
          targetPath ? { path: targetPath } : {}
        ),
        headers: axiosHeaders
      });

      entryes.unshift(["_vendors"]);

      // 生成一个用于提交的commits
      const commits = {
        branch: currentPubOption.branch,
        commit_message: `${new Date().toLocaleString()} branch [${currentPubOption.branch}] xcli publish commit`,
        actions: []
      };

      // 先删除对应entry中已存在的文件
      _each(getCurrentRepository.data, function(file, index) {
        //console.log(file);
        if (file.type === "blob" && findInEntry(entryes, file.path, targetPath, prefixAbcJSON.name)){
          commits.actions.unshift({
            action: "delete",
            file_path: file.path
          });
        }
      });

      sp.succeed("scan sucess and compare with commits file");

      // 发布entry中的文件
      _each(entryes, function(entry) {
        log(`scan entry = ${("[" + entry + "]").green.bold}`);

        _each(glob.sync(`${currentOutputPath}/${entry}/*.*`), function(filepath) {
          const upFilePath = pathCater(currentOutputPath,filepath,targetPath);

          log(`prepare commit file: ${filepath.split(currentPath)[1].yellow} -> ${upFilePath.red}`);

          commits.actions.push({
            action: "create",
            file_path: upFilePath,
            content: fs.readFileSync(filepath, "utf8")
          });
        });
      });

      const sp2 = loading("push commits merge to remote respository...");

      return axios({
        method: "post",
        url: processGitLabAPI(
          gitlab,
          `projects/${projectId}/repository/commits`
        ),
        headers: _merge(axiosHeaders, {
          "Content-Type": "application/json"
        }),
        data: commits
      }).then(
        res => {
          if (res && res.data) {
            if (res.data.id && res.data.message) {
              sp2.succeed("push commits success");
              log(`publish upcommit success to gitlab: ${currentPubOption.repository}`.green);
              fse.removeSync(currentOutputPath);
            } else {
              sp2.fail("push throw error");
              error(res);
              error(`publish upcommit fails with gitlab: ${currentPubOption.repository}`);
              fse.removeSync(currentOutputPath);
            }
            process.exit();
          }
        },
        res => {
          sp2.fail("catch request throw error");
          error(res);
          fse.removeSync(currentOutputPath);
        }
      );
      // 查找项目中是否包含该发布项目
    });
  };

  return upCommitToGitLab(publishOptions, publishEntry, gitLabToken);
};
