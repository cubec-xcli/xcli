const fs = require('fs');
const path = require('path');
const util = require('util');
const fse = require('fs-extra');
const { prompt } = require('enquirer');
const struct = require('ax-struct-js');
const download = require('download-git-repo');
const paths = require('../../core/utils/paths');
const getTargetEntryJS = require('../../core/common/pre/getTargetEntry');
const checkPluginExist = require('../../core/common/tools/checkPluginExist');
const { error, warn, info, loading } = require('../../core/utils/std');
const defaultNewAbcJSON = require('../../config/defaultNewAbcJSON');
const defaultNewAbcxJSON = require('../../config/defaultNewAbcxJSON');
const callCreate = require('../create/adapter/callCreate');

const keys = struct.keys();
const merge = struct.merge();

const newCommand = async function(projectFolder){
  const fsreaddir = util.promisify(fs.readdir);
  const fswriteFile = util.promisify(fs.writeFile);

  const projectPath = path.resolve(paths.currentPath, projectFolder || "");
  const abcJSONPath = path.resolve(projectPath, "abc.json");
  const abcxJSONPath = path.resolve(projectPath, "abcx.json");

  // new Project abc.json
  // or new XCLI Plugin with abcx.json
  const typesMap = {
    "[XCLI CORE] New Project (新项目)" : "project",
    "[XCLI CORE] New XCLI Plugin [development] (新插件)" : "plugin"
  };

  const { typeChoice } = await prompt({
    type: "select",
    name: "typeChoice",
    message: "[XCLI CORE] [new] select init type project",
    choices: keys(typesMap)
  });

  const type = typesMap[typeChoice];

  // new Project
  if(type === "project"){
    // if exist abc.json
    if(fs.existsSync(abcJSONPath))
      return warn('[XCLI CORE] abc.json already exist in current project folder '+projectPath.bold);

    // input project name
    const { projectName } = await prompt({
      type: "input",
      name: "projectName",
      required: true,
      message: "[XCLI CORE] [new] project name",
      initial: (projectFolder||"").split("/")[0],
    });

    const choicesPlugin = {};

    let plugins = await fsreaddir(paths.pluginsPath);

    plugins = plugins.filter(plugin=>plugin[0] !== ".").map(plugin=>{
      const pluginPathDir = path.resolve(paths.pluginsPath, plugin);
      const getPluginPath = fs.lstatSync(pluginPathDir);
      const getPluginAbcxJSON = require(path.resolve(pluginPathDir, "abcx.json"));
      const namePrefix = getPluginPath.isSymbolicLink() ? "[linked]".green.bold : `[${getPluginAbcxJSON["plugin-version"]}]`.yellow;

      const name = `${"[Plugin]".bold} ${namePrefix} ${plugin.red.bold}`;
      choicesPlugin[name] = plugin;

      return name;
    });

    choicesPlugin["NO-SELECT"] = "NO-SELECT";

    // input plugin for use
    let { pluginType } = await prompt({
      type: "autocomplete",
      name: "pluginType",
      message: "[XCLI CORE] [new] project use plugin:type in xcli",
      limit: 10,
      choices: ["NO-SELECT"].concat(keys(choicesPlugin))
    });

    pluginType = choicesPlugin[pluginType];

    if(pluginType === "NO-SELECT"){
      const { customPluginType } = await prompt({
        type: "input",
        name: "customPluginType",
        required: true,
        message: "[XCLI CORE] [new] input project use custom plugin:type",
      });

      pluginType = customPluginType;
    }

    // console.log("pluginType", pluginType);

    // input plugin package manager
    const { projectPackageManager } = await prompt({
      type: "autocomplete",
      name: "projectPackageManager",
      required: true,
      message: "[XCLI CORE] [new] project package manager",
      choices: ["npm", "yarn"]
    });

    // create abcJSON
    const abcJSON = merge({
      name: projectName,
      type: pluginType,
      package: projectPackageManager
    }, defaultNewAbcJSON);

    await fse.ensureDir(projectPath);

    await fswriteFile(abcJSONPath, JSON.stringify(abcJSON, null, 2));

    info("[XCLI CORE] init project abc.json completed");

    // 如果存在对应的插件
    if(checkPluginExist(pluginType, true)){
      const createImplement = await getTargetEntryJS(pluginType, "create.js", true);

      if(createImplement){
        const { needCreate } = await prompt({
          type: "confirm",
          name: "needCreate",
          message: "[XCLI CORE] find initial create actions by plugin " + ("["+pluginType+"]").bold.red + ". need create plugin template together?"
        });

        if(needCreate)
          await callCreate(createImplement, null, projectPath);
      }

      // console.log(process.cwd());
    }

    info("[XCLI CORE] init project completed use plugin " + ("["+ pluginType +"]").red.bold);
    info("[XCLI CORE] init project path: "+projectPath.red.bold);

    return;

  // create new plugin
  }else if(type === "plugin"){
    // if exist abc.json
    if(fs.existsSync(abcxJSONPath))
      return warn('[XCLI CORE] abcx.json already exist in current project folder '+projectPath.bold);

    // input plugin name
    const { pluginName } = await prompt({
      type: "input",
      name: "pluginName",
      required: true,
      message: `[XCLI CORE] [new] plugin name (suggest: ${"[name]-xcli-plugin".red})`,
      initial: (projectFolder||"").split("/")[0],
    });

    // input plugin package manager
    const { pluginPackageManager } = await prompt({
      type: "autocomplete",
      name: "pluginPackageManager",
      required: true,
      message: "[XCLI CORE] [new] plugin package manager",
      choices: ["npm", "yarn"]
    });

    const abcxJSON = merge(defaultNewAbcxJSON, {
      "plugin-name": pluginName,
      "plugin-package": pluginPackageManager
    });

    await fse.ensureDir(projectPath);

    const initLoading = loading("download plugin template from remote github");

    return download("cubec-xcli/xcli-plugin-template", projectPath, async err=>{
      if(err){
        initLoading.fail("init plugin failed with unexcepted error");
        return error(err);
      }

      await fswriteFile(abcxJSONPath, JSON.stringify(abcxJSON, null, 2));

      initLoading.succeed("remote download plugin template completed");
      info("[XCLI CORE] init plugin completed "+("["+pluginName+"]").bold.red);
      info("[XCLI CORE] init plugin template path: "+ projectPath.bold.red);
    });
  }

  return error("[XCLI CORE] no init type select unexpected");
};

module.exports = newCommand;
