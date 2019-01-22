const fs = require('fs');
const path = require('path');
const util = require('../lib/util');
const colors = require('colors');
const {paths, abcJSON} = util;
const {log, error} = util.msg;
const {currentPath} = paths;

module.exports = function(shouldfix) {

  if (abcJSON) {
    // printCommanLog();

    let startPath = `${currentPath}/**/*.js`;

    // 优先使用项目自带的 eslintrc 配置
    let eslintConfig;
    if(fs.existsSync(`${currentPath}/.eslintrc.js`)){
      eslintConfig = require(`${currentPath}/.eslintrc.js`);
    }else if(fs.existsSync(path.join(__dirname, `../packages/${abcJSON.type}/.eslintrc.js`))){
      log("use packages eslint config");
      eslintConfig = require(path.join(__dirname, `../packages/${abcJSON.type}/.eslintrc.js`));
    }else{
      return error(`type of [${abcJSON.type}] project missing eslintrc config`);
    }
    //console.log(eslintConfig);

    const eslint = require('eslint');
    const cli = new eslint.CLIEngine(eslintConfig);

    log(
      `use Eslint check code style version: ${eslint.CLIEngine.version.blue}`,
    );

    const formatter = cli.getFormatter();
    const report = cli.executeOnFiles([startPath]);
    // const errorReport = eslint.CLIEngine.getErrorResults(report.results);

    console.log(formatter(report.results));

    if (shouldfix === 'fix') eslint.CLIEngine.outputFixes(report);
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
