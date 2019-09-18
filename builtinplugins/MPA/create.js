const fs = require('fs');
const path = require('path');
const colors = require("colors");

const createPage = async function(context, args) {
  const { projectName, createPath, utils } = context;
  const { tools, std, paths } = utils;
  const { fsextra:fse } = tools.modules;
  const { warn, info } = std;

  let pageName = projectName;
  let pageInitPath = createPath;
  const useTypeScript = fs.existSync(path.resolve(paths.currentPath, "tsconfig.json"));

  if (!pageName) {
    const { name } = await prompt({
      type: "input",
      name: "name",
      message: "Input the page name"
    });
    pageName = name;
  }

  pageInitPath += "/src/" + pageName;

  if (tools.file.existDir(pageInitPath)) {
    const { replace } = await prompt({
      type: "confirm",
      name: "replace",
      message: `The new page name [${pageName.bold.red}] already exist，Need to perform mandatory override creation??`
    });

    if (!replace) {
      warn("New [MPA] page creation interrupt, not completed initialization");
      return false;
    }

    fse.removeSync(pageInitPath);
  }

  await fse.ensureDir(pageInitPath);

  await fse.copy(`${__dirname}/initTemplates/${useTypeScript ? "tstemplate" : "jstemplate"}`, pageInitPath);

  info("[MPA] create new page completed");

  return true;
};

const createTemplate = async function(context, args){
  const { createPath, projectName, utils } = context;
  const { tools, std } = utils;
  const { fsextra:fse } = tools.modules;
  const { warn, info } = std;

  // 如果存在初始化名称
  if(projectName){
    if(tools.file.existDir(createPath)){
      const { replace } = await prompt({
        type: "confirm",
        name: "replace",
        message: `The new project name [${projectName.bold.red}] already exist，Need to perform mandatory override creation??`
      });

      if (!replace) {
        warn("[MPA] new project init creation interrupt, not completed initialization");
        return false;
      }

      fse.emptyDirSync(createPath);
    }
  }

  // 不存在初始化名称 可以直接创建
  await fse.ensureDir(createPath);

  await fse.copy(`${__dirname}/initTemplates/_mpa_project_template`, createPath);

  // execSync(`${prefixAbcJSON.package} init`, { cwd: createPath });

  info("[MPA] create init project completed");

  return true;
};

module.exports = {
  "[MPA] Create Page": {
    "[MPA] [New Page] Base Page Template": createPage(),
  },
  "[MPA] Create Project Application Template": createTemplate
};
