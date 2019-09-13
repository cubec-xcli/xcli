const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');
const createLabel = require('./tools/createLabel');

const debugLabel = createLabel(c.bg.White,c.fg.Black,"DEBUG");

module.exports = function(msg){
  return console.log(debugLabel, trim(msg||""));
};
