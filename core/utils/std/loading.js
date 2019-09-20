const ora = require('ora');
const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');

const loadLabel = c.bg.Cyan + c.fg.Black + " LOADING... " + c.Reset;
const failedLabel = c.bg.Red + c.fg.Black + " FAILED " + c.Reset;
const successLabel = c.bg.Green + c.fg.Black + " SUCCESS " + c.Reset;

const loading = function(msg, type="hamburger"){
  const loadingInstance = new ora({
    text: loadLabel + " " +trim(msg || '')+"\n",
    spinner: type
  }).start();

  return {
    succeed(smsg){
      loadingInstance.succeed(successLabel+ " "+trim(smsg||msg||'').green);
    },
    fail(fmsg){
      loadingInstance.fail(failedLabel+ " "+trim(fmsg||msg||'').red);
    }
  };
};

module.exports = loading;
