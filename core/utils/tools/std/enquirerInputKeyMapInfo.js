const colors = require("colors");

module.exports = function(message){
  return message + `「 [Input Keyword]. [↑]: up. [↓]: down. [ESC]: exit 」`.bold.red;
};
