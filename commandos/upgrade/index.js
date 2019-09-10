const git = require('simple-git');
const paths = require('../../core/utils/paths');

const upgradeCommand = async function(version){
  const xcliGit = git(paths.cliRootPath);

  xcliGit.pull(function(err, upgrade){
    console.log(err);
    console.log(upgrade);
  });

  return true;
};

module.exports = upgradeCommand;
