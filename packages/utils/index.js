
const c = require('chalk');
const fse = require('fs-extra');
const fetch = require('node-fetch');
const util = require('./lib/_util');

const utils = {
  ...util,
  c,
  chalk: c,
  color: c,
  fse,
  fetch,
  astCtrl: require('./lib/ast'),
  npm: require('./lib/npm'),
  log: require('./lib/log'),
  git: require('./lib/git'),
  zip: require('./lib/zip'),
  spinner: require('./lib/spinner'),
  DDWebhook: require('./lib/dd-webhook')
}


module.exports = utils;