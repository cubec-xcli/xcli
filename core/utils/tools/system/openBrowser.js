const SYSTEM = require ('../../../../dict/tools/SYSTEM');
const openBrowser = require("open");
const { execSync } = require("child_process");
const os = require('../../os');

module.exports = function(url){
  if(os.type === "Darwin"){
    const openScript = `osascript ${__dirname}/openChromeMacOS.scpt ${url}`;
    execSync(openScript);
  }else{
    openBrowser(url, {
      app: [SYSTEM.BROWSER_SYSTEM_MAPPING[os.type]]
    });
  }
};
