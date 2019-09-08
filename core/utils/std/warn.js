const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');
const createLabel = require('./tools/createLabel');

const warnLabel = createLabel(c.bg.Yellow,c.fg.Black,"WARN");

module.exports = function(msg){
  return console.log(warnLabel, trim(msg||"").yellow);
};
