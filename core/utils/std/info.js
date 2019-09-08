const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');
const createLabel = require('./tools/createLabel');

const infoLabel = createLabel(c.bg.Green,c.fg.Black,"INFO")

module.exports = function(msg){
  return console.log(infoLabel, trim(msg||"").green);
};

