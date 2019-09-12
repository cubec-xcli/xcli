const cls = require('colors');
const { createLabel, colors } = require('../../core/utils/std');

const initLabel = createLabel(colors.bg.Cyan, colors.fg.Black, "INIT");
const successLabel = createLabel(colors.bg.Green, colors.fg.Black, "SUCCESS");
const failedLabel = createLabel(colors.bg.Red, colors.fg.Black, "FAILED");

module.exports = {
  SELECT_TEMPLATE_TITLE: initLabel + " choice (init|create) template ",

  LOADING_PREPARE_DOWNLOAD: "prepare download remote template file...",

  INFO_SUCCESS_DOWNLOAD_FORM_REMOTE: successLabel + " completed create project from remote template".green,

  WARN_INIT_ACTION_CANCEL: "create action exit (cancel clear folder)",

  ERROR_UNKNOWN_ACTION: "create template with unkown action",

  ERROR_FAIL_DOWNLOAD_FORM_REMOTE: failedLabel + " download remote template throw error".red,

  ERROR_WITHOUT_FIND_TEMPLATE: "no create template with current project"
};
