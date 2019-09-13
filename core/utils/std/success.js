const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');
const createLabel = require('./tools/createLabel');

const successLabel = createLabel(c.bg.Green,c.fg.Black,"SUCCESS")

module.exports = function(msg){
  return console.log(successLabel, trim(msg||"").green);
};

