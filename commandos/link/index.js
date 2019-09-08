const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const paths = require('../../core/utils/paths');
const { info, error } = require('../../core/utils/std');
const checkPluginAbcxJSONFormat = require('../../core/common/pre/checkPluginAbcxJSONFormat');

const linkCommand = function(){
  if(checkPluginAbcxJSONFormat()){
    const targetFolder = path.resolve(paths.currentPath);
    const abcxJSON = require(path.resolve(targetFolder, 'abcx.json'));
    const linkToPath = path.resolve(paths.cliRootPath, `plugins/${abcxJSON['plugin-name']}`);

    // console.log(targetFolder);
    // console.log(linkToPath);

    // 如果文件已经存在了
    if(fs.existsSync(linkToPath)){
      const stats = fs.lstatSync(linkToPath);

      if(stats.isSymbolicLink())
        fs.unlinkSync(linkToPath);
      else
        fse.removeSync(linkToPath);
    }

    return fs.symlink(targetFolder, linkToPath, function(err){
      if(err) return error(`faild to link plugin ${abcxJSON['plugin-name']}`);

      info(`${("["+abcxJSON['plugin-name']+"]").bold} linked completed`);
    });
  }
};

module.exports = linkCommand;
