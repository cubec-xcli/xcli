const fs = require('fs');
const path = require('path');
const paths = require('../../core/utils/paths');
const { info, warn } = require('../../core/utils/std');
const checkPluginAbcxJSONFormat = require('../../core/common/pre/checkPluginAbcxJSONFormat');

const unlinkCommand = function(){
  if(checkPluginAbcxJSONFormat()){
    const abcxJSON = require(path.resolve(paths.currentPath, 'abcx.json'));
    const linkToPath = path.resolve(paths.cliRootPath, `plugins/${abcxJSON['plugin-name']}`);

    if(fs.existsSync(linkToPath)){
      const stats =fs.lstatSync(linkToPath);

      if(stats.isSymbolicLink())
        fs.unlink(linkToPath, ()=>{});

      info(`${("["+abcxJSON['plugin-name']+"]").bold} unlinked completed`);
    }else{
      warn(`not plugin ${abcxJSON['plugin-name'].bold} need unlink`);
    }
  }
};

module.exports = unlinkCommand;
