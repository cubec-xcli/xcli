const cls = require('colors');
const { createLabel, colors } = require('../../core/utils/std');

const pubLabel = createLabel(colors.bg.Red, colors.fg.Black, "PUBLISH");

module.exports = {
  CHOICE_PUBLISH_ENTRY_MESSAGE: pubLabel + ` choice ${"mode".red.bold} option for project publish action`,

  PUBLISH_OPTIONS_REQUIRED: `${"[abcJSON]".bold} must contains at least one published option configuration`
};
