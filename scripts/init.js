const fs = require('fs');
const fse = require('fs-extra');
const colors = require('colors');
const template = require('../config/initTemplate');

const util = require('../lib/util');
const mkdirp = require('mkdirp');
const download = require('download-git-repo');
const {prompt} = require('inquirer');

const {log, warn, error, loading} = util.msg;
const pathChecker = /^([a-zA-Z0-9_]+)$/i;

// Defined
// create init function
const initProject = function(path, create, clear) {
  prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Choice the project type',
      choices: Object.keys(template),
    },
  ]).then(({type}) => {
    log(`The root path: ${path.blue}`);

    if (clear) {
      log(`running path clear process`);
      fse.removeSync(path);
    }

    return create
      ? mkdirp(path, () => downloadProject(path, type))
      : downloadProject(path, type);
  });
};

// create @type template
const downloadProject = function(path, type) {
  if (template[type]) {
    let sp = loading(`init create ${type.red}`);

    download(template[type], path, err => {

      if (err){
        sp.fail();
        error('init error'.red);
        throw err;
      } else {
        sp.succeed();
        log('init complete');
      }

      process.stdout.write('\n');

    });
  } else {
    error('can not find typeof project template on remote gitsource'.red);
  }
};

// Export init task
module.exports = function(ProjectName) {
  const initProjectName = !!ProjectName;
  const projectName = ProjectName || util.paths.currentDir || '';
  const path = `${process.cwd()}${initProjectName ? `/${projectName}` : ''}`;

  if (!pathChecker.test(projectName))
    return error(
      `initialize project name as ${projectName.bold} is invalid`.red,
    );

  log(`initialize: { ${projectName.red.bold} }`);

  if (initProjectName) {
    if (util.existDir(path)) {
      prompt([
        {
          type: 'confirm',
          name: 'overwritte',
          message: `${
            projectName.blue.bold
          } directory already exists, whether to perform overwrite operation??`,
          default: false,
        },
      ]).then(({overwritte}) => {
        if (overwritte) initProject(path, true, true);
      });
    } else {
      initProject(path, true);
    }
  } else {
    const files = fs.readdirSync(path);

    if (files.length) {
      files.forEach(file => console.log(file.blue));

      prompt([
        {
          type: 'confirm',
          name: 'overwritte',
          message: `${projectName}The directory already exists above the file, whether to continue to perform initialization?`,
          default: false,
        },
      ]).then(({overwritte}) => {
        if (overwritte) {
          warn('Mandatory initialization operation!'.yellow);

          initProject(path);
        }
      });
    } else {
      initProject(path);
    }
  }
};
