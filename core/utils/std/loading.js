const ora = require('ora');
const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');

const loadLabel = c.bg.Cyan + c.fg.Black + " LOADING... " + c.Reset;
const failedLabel = c.bg.Red + c.fg.Black + " FAILED " + c.Reset;
const successLabel = c.bg.Green + c.fg.Black + " SUCCESS " + c.Reset;

const loading = function(msg, type="hamburger"){
  const loadingInstance = new ora({
    text: trim(loadLabel + " " +(msg || '')),
    spinner: type
  }).start();

  return {
    succeed(smsg){
      loadingInstance.succeed(successLabel+ " "+(smsg||msg||''));
    },
    fail(fmsg){
      loadingInstance.fail(failedLabel+ " "+(fmsg||msg||''));
    }
  };
};

module.exports = loading;
