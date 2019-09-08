const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');
const createLabel = require('./tools/createLabel');

const errorLabel = createLabel(c.bg.Red, c.fg.Black, "ERRO");

module.exports = function(msg){
  console.log(errorLabel, trim(msg||"").red);
  return false;
};
