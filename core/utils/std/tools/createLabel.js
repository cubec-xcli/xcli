const c = require('../xtermcolors');

module.exports = function(bg,fg,msg){
  return bg + fg + ` ${msg} ` + c.Reset;
};
