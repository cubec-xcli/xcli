const fs = require('fs');
const fse = require('fs-extra');
const util = require('util');
const path = require('path');
const paths = require('../../core/utils/paths');
const { info, warn } = require('../../core/utils/std');
const checkPluginAbcxJSONFormat = require('../../core/common/pre/checkPluginAbcxJSONFormat');

const unlinkCommand = async function(){
  const abcxJSON = checkPluginAbcxJSONFormat();

  if(abcxJSON){
    const pluginsDir = paths.pluginsPath;
    const linkToPath = path.resolve(paths.pluginsPath, `${abcxJSON['plugin-name']}`);

    await fse.ensureDir(pluginsDir);

    if(fs.existsSync(linkToPath)){
      const fsunlink = util.promisify(fs.unlink);
      const stats =fs.lstatSync(linkToPath);

      if(stats.isSymbolicLink()) await fsunlink(linkToPath);

      info(`${("["+abcxJSON['plugin-name']+"]").bold} unlinked completed`);
    }else{
      warn(`not plugin ${abcxJSON['plugin-name'].bold} need unlink`);
    }
  }
};

module.exports = unlinkCommand;
