const fs = require('fs');
const path = require('path');
const colors = require('colors');
const Spinner = require('cli-spinner').Spinner;
const {execSync} = require('child_process');
const struct = require('ax-struct-js');
const ip = require('ip');

const _map = struct.map();
const _merge = struct.merge();

let currentPath = process.cwd();
let currentDir = path.basename(currentPath);
let abcJSON = fs.existsSync(`${currentPath}/abc.json`) ? require(`${currentPath}/abc.json`) : {
  path: {
    output: "/",
    public: "/",
  }
};
let outputPath = path.resolve(currentPath, abcJSON.path.output);
let publicPath = path.resolve(currentPath, abcJSON.path.public);
let xcliPath = path.resolve(__dirname, "../");
let mockServer = path.resolve(currentPath, 'mock')
let ipadress = ip.address();

const loger = `
   ____  ___     .__  .__ 
   \\   \\/  /____ |  | |__|
    \\     // ___\\|  | |  |
    /     \\  \\___|  |_|  |
   /___/\\  \\___  >____/__|
         \\_/   \\/         
`;


const existDir = function(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
};

const log = function(msg) { console.log(`${'[info]'.green.bold} ${msg}`); };

const warn = function(msg) { console.log(`${'[warn]'.yellow.bold} ${msg}`); };

const error = function(msg) { console.log(`${'[error]'.red.bold} ${msg}`); };

const printCommanLog = function() { console.log(loger.red, '\n'); };

const preinstall = function(prefix) {
  const spinner = new Spinner(`${'[info]'.green.bold} npm installing %s`);

  spinner.start();
  spinner.setSpinnerString(3);
  console.log();
  execSync('npm install' + (prefix ? ` --prefix ${prefix}` : ''));
  spinner.stop();
  log("npm installing completed!");
};

// modify alias
abcJSON.alias = _map(abcJSON.alias, (alia)=>{
  return path.resolve(currentPath, alia);
});

// merge defaut option
abcJSON = _merge({
  devServer: {
    port: 9001,
    https: false
  }
}, abcJSON);

module.exports = {
  preinstall,
  printCommanLog,
  existDir,
  abcJSON,
  paths: {
    xcliPath,
    ipadress,
    currentDir,
    currentPath,
    existDir,
    outputPath,
    publicPath,
    mockServer
  },
  msg: {
    log,
    warn,
    error,
  },
};
