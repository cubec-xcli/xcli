const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const util = require('util');
const paths = require('../../core/utils/paths');
const { info, error } = require('../../core/utils/std');
const checkPluginAbcxJSONFormat = require('../../core/common/pre/checkPluginAbcxJSONFormat');

const linkCommand = async function(){
  const abcxJSON = checkPluginAbcxJSONFormat();

  if(abcxJSON){
    const fsunlink = util.promisify(fs.unlink);
    const pluginsDir = paths.pluginsPath;
    const targetFolder = path.resolve(paths.currentPath);
    const linkToPath = path.resolve(paths.pluginsPath, `${abcxJSON['plugin-name']}`);

    // console.log(targetFolder);
    // console.log(linkToPath);
    await fse.ensureDir(pluginsDir);

    // 如果文件已经存在了
    if(fs.existsSync(linkToPath)){
      const stats = fs.lstatSync(linkToPath);

      if(stats.isSymbolicLink()) await fsunlink(linkToPath);
      else await fse.remove(linkToPath);
    }

    return fs.symlink(targetFolder, linkToPath, 'junction', function(err){
      if(err) return error(`faild to link plugin ${abcxJSON['plugin-name']}`);

      info(`${("["+abcxJSON['plugin-name']+"]").bold} linked completed`);
    });
  }
};

module.exports = linkCommand;
