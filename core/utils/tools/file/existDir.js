const fs = require('fs');

module.exports = function(path){
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
};
