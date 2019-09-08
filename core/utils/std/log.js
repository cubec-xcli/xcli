const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');
const createLabel = require('./tools/createLabel');

const logLabel = createLabel(c.bg.White,c.fg.Black,"LOG");

module.exports = function(msg){
  return console.log(logLabel, trim(msg||""));
};
