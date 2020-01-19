const colors = require("colors");

module.exports = function(message){
  return message + `「 [space]: select. [a]: all. [ESC]: exit 」`.bold.red;
};
