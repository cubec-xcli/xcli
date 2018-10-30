const fs = require('fs');
const util = require('../lib/util');
const colors = require('colors');
const {printCommanLog, paths, abcJSON} = util;
const {log, error} = util.msg;

module.exports = function(path, param) {
  if (abcJSON) {
    printCommanLog();

    const type = abcJSON.type;

    let startPath = `${process.cwd()}/`;

    if (path === '.') startPath = `${startPath}**/*.js`;
    else startPath = `${startPath}${path}/**/*.js`;

    const eslintConfig = {};
    const eslint = require('eslint');
    const cli = new eslint.CLIEngine(eslintConfig);

    log(
      `use Eslint check code style version: ${eslint.CLIEngine.version.blue}`,
    );

    const formatter = cli.getFormatter();
    const report = cli.executeOnFiles([startPath]);
    // const errorReport = eslint.CLIEngine.getErrorResults(report.results);

    console.log(formatter(report.results));

    if (param === 'fix') eslint.CLIEngine.outputFixes(report);
  } else {
    error(`Can not find ${'abc.json'.bold} in current directory`.red);
  }
};
