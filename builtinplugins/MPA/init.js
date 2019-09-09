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
        warn("New page creation interrupt, not completed initialization");
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
  "[MPA] Create Page": {
    "[MPA] [New Page] Base JavaScript Template": createPage('jstemplate'),
    "[MPA] [New Page] Base Typescript Template": createPage('tstemplate')
  }
};
