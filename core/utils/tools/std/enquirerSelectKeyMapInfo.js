const colors = require("colors");

module.exports = function(message){
  return message + `「 [space]: select. [a]: all. [↑]: up. [↓]: down. [ESC]: exit 」`.bold.red;
};
