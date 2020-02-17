const { execSync } = require('child_process');
const normalizePath = require('normalize-path');
const path = require('path');
const execa = require('execa');
const os = require('os');
const log = require('./log');
const cwd = process.cwd();

/**
 * 优雅的判断参数类型
 */
function getArgType(agr) {
  const type = Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
  const obj = {};
  ['Array', 'Boolean', 'Number', 'Object', 'Promise', 'String', 'Map', 'RegExp', 'Set', 'Weakmap', 'Weakset', 'Symbol', 'Null', 'Undefined'].forEach(item => {
    obj[`is${item}`] = item.toLowerCase() === type;
  });
  obj.isFunction = ['asyncfunction', 'generatorfunction', 'function'].indexOf(type) >= 0;
  return obj;
}

/**
 * 是否支持yarn
 */
function hasYarn() {
  let hasYarn;
  try {
    execSync('yarn -v');
    hasYarn = true;
  } catch(e) {
    hasYarn = false;
  }
  return hasYarn;
}

// execCmd([cmd])([agruments]);
const createExecCmd = (type, tip) => cmd => (agrs = []) => {
  const agrType = getArgType(agrs);
  if (!agrType.isArray) {
    log.error(tip, type);
    process.exit(0);
  }
  if (cmd) {
    agrs.unshift(cmd);
  }
  return execa.sync(type, agrs);
}

const _util = {
  cwd, // 获取执行目录，根目录
  hasYarn,
  resolvePkg,
  getArgType,
  getHomedir,
  createExecCmd
}

/**
 * 获取不同平台的home目录
 */
function getHomedir() {
  return (typeof os.homedir == 'function' ? os.homedir() :
  process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']) || '~';
}

/**
 * 兼容windows和linux的文件路径格式化
 */
;['resolve', 'join'].forEach(item => {
  _util[item] = function() {
    return normalizePath(path[item].apply(path, arguments));
  };
});

/**
 * 从根目录resolve
 */
_util.resolveCWD = function(...target) {
  target.unshift(cwd);
  return _util.resolve.apply(path, target);
}

/**
 * 从当前目录resolve
 */
_util.resolveDirname = function(...target) {
  target.unshift(__dirname);
  return _util.resolve.apply(path, target);
}

/**
 * 从home目录resolve
 */
_util.resolveHome = function(...target) {
  target.unshift(getHomedir());
  return _util.resolve.apply(path, target);
}

/**
 * 从根目录join
 */
_util.joinCWD = function(...target) {
  target.unshift(cwd);
  return _util.join.apply(path, target);
}

/**
 * 从当前目录join
 */
_util.joinDirname = function(...target) {
  target.unshift(__dirname);
  return _util.join.apply(path, target);
}

/**
 * 从home目录join
 */
_util.joinHome = function(...target) {
  target.unshift(getHomedir());
  return _util.join.apply(path, target);
}

/**
 * 获取项目根目录的package.json，如果有lerna.json的话，会合并到一起
 */
function resolvePkg() {
  let pkg = {};
  let lernaJson = {};
  try {
    pkg = require(_util.resolveCWD('package.json'));
  } catch(e) {
    log.error(e);
    process.exit(0);
  }
  try {
    lernaJson = require(_util.resolveCWD('lerna.json'));
  } catch(e) {}
  return { ...pkg, ...lernaJson };
};

module.exports = _util;