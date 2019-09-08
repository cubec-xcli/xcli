const colors = require("colors");
const { prompt } = require("enquirer");
const fse = require("fs-extra");

const createPage = function(pageType) {
  return async function(context, args) {
    const { projectName, projectRoot, utils } = context;
    const { tools, std } = utils;
    const { warn } = std;

    let pageName = projectName;
    let pageInitPath = projectRoot;

    if (!pageName) {
      const { name } = await prompt({
        type: "input",
        name: "name",
        message: "输入页面的名称"
      });

      pageName = name;
    }

    pageInitPath += "/src/" + pageName;

    if (tools.file.existDir(pageInitPath)) {
      const { replace } = await prompt({
        type: "confirm",
        name: "replace",
        message: `需要新建的页面 [${pageName.bold.red}] 在资源目录中已经存在了，是否需要强制执行翻盖式新建?`
      });

      if (!replace) {
        warn("新建页面操作中断，未完成初始化");
        return false;
      }

      fse.removeSync(pageInitPath);
    }

    await fse.ensureDir(pageInitPath);

    await fse.copy(`${__dirname}/initTemplates/${pageType}`, pageInitPath);

    return true;
  };
};

module.exports = {
  "[MPA] 创建新页面": {
    "[MPA] [新页面] JavaScript模板": createPage('jstemplate'),
    "[MPA] [新页面] Typescript模板": createPage('tstemplate')
  }
};
