const fs = require('fs');
const path = require('path');
const colors = require('colors');
const {execSync} = require('child_process');
const ora = require('ora');
const struct = require('ax-struct-js');
const ip = require('ip');
const loger = `
   ____  ___     .__  .__ 
   \\   \\/  /____ |  | |__|
    \\     // ___\\|  | |  |
    /     \\  \\___|  |_|  |
   /___/\\  \\___  >____/__|
         \\_/   \\/         
`;

const _map = struct.map();
const _merge = struct.merge();

let currentPath = process.cwd();
let currentDir = path.basename(currentPath);
let abcJSON = fs.existsSync(`${currentPath}/abc.json`) ? require(`${currentPath}/abc.json`) : null;
let outputPath = path.resolve(currentPath, abcJSON ? abcJSON.path.output : "");
let publicPath = path.resolve(currentPath, abcJSON ? abcJSON.path.public : "");
let xcliPath = path.resolve(__dirname, "../");
let tokenPath = path.resolve(__dirname, "../config/.token");
let mockServer = path.resolve(currentPath, 'mock')
let ipadress = ip.address();

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

const loading = function(msg, type="hamburger"){
  const spinner = new ora({
    text: msg || '',
    spinner: type
  }).start();

  return spinner;
}

const printCommanLog = function() { console.log(loger.red, '\n'); };

const preinstall = function(prefix="") {
  log(`npm installing ${prefix}`);

  if(prefix){
    execSync(`npm --prefix ${prefix} install ${prefix}`);
  }else{
    execSync("npm install");
  }

  log("npm installing completed!");
};

if(abcJSON){
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
}

module.exports = {
  preinstall,
  printCommanLog,
  existDir,
  abcJSON,
  paths: {
    xcliPath,
    tokenPath,
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
    loading,
  },
};
