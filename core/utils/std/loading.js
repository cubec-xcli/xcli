const ora = require('ora');
const c = require('./xtermcolors');
const colors = require('colors');
const { trim } = require('lodash');

const loadLabel = c.bg.Green + c.fg.Black + " LOADING... " + c.Reset;
const loading = function(msg, type="hamburger"){
  return new ora({
    text: trim(loadLabel + " " +(msg || '')),
    spinner: type
  }).start();
};

module.exports = loading;
