const git = require('simple-git');
const colors = require('colors');
const path = require('path');
const struct = require('ax-struct-js');
const { execSync } = require('child_process');
const paths = require('../../core/utils/paths');
const { info, error, loading } = require('../../core/utils/std');
const UPGRADE = require('../../dict/commandos/UPGRADE');

const has = struct.has();

const upgradeCommand = function(version){
  const xcliGit = git(paths.cliRootPath);
  const packageJSONPath = path.resolve(paths.cliRootPath, 'package.json');

  // 拉取源码
  xcliGit.pull(function(err, upgrade){
    if(err){
      error(UPGRADE.UPGRADE_GITPULL_UNEXCEPT_ERROR);
      throw new Error(err);
    }

    if(upgrade){
      // const fsreaddir = util.promisify(fs.readdir);

      if(upgrade.files.length){
        info(UPGRADE.UPGRADE_PROCESS_GITPULL_COMPLETED);

        // 有更新 xcli 的 package.json
        if(has(upgrade.files, "package.json")){
          const package_loading = loading(UPGRADE.UPGRADE_PROCESS_CORE_PACKAGE);
          execSync(`npm install`, { cwd: paths.cliRootPath, stdio: 'inherit' });
          package_loading.succeed(UPGRADE.UPGRADE_PROCESS_CORE_PACKAGE+" completed");
        }

      }
    }

    const packageJSON = require(packageJSONPath);

    info(UPGRADE.UPGRADE_CORE_SUCCESS);

    info(`xcli version ${("[" + packageJSON.version + "]").bold}`);

    return process.exit(0);
  });

  return true;
};

module.exports = upgradeCommand;
