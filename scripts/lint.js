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
    let startJSPath = `${currentPath}/**/*.js`;
    let startStylePath = `${currentPath}/**/*.scss`;

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
    const stylelint = require('stylelint');
    const stylelintFormatter = require('stylelint-formatter-pretty');
    const cli = new eslint.CLIEngine(eslintConfig);

    stylelint.lint({
      files: startStylePath,
      formatter: stylelintFormatter,
      config: {
        "extends": require.resolve("stylelint-config-standard"),
      },
      syntax: "scss"
    }).then(function(data){
      console.log("");
      console.log("----------------- stylelint -----------------".red.bold);
      console.log(data.output);
      console.log("----------------- stylelint end -----------------".red.bold);
    }).catch(function(err){
      // do things with err e.g.
      console.error(err.stack);
    });

    log(
      `use Eslint check code style version: ${eslint.CLIEngine.version.blue}`,
    );

    const formatter = cli.getFormatter();
    const report = cli.executeOnFiles([startJSPath]);
    // const errorReport = eslint.CLIEngine.getErrorResults(report.results);

    console.log("");
    console.log("----------------- eslint -----------------".red.bold);
    console.log(formatter(report.results));
    console.log("----------------- eslint end -----------------".red.bold);

    if (shouldfix === 'fix') eslint.CLIEngine.outputFixes(report);
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
