const { execSync } = require('child_process');
const normalizePath = require('normalize-path');
const portfinder = require('portfinder');
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
 * 解析函数的参数名
 * @param {string} fn 
 * @example
 * getArgsFromFunc($a, $b)
 * => ['$a', '$b']
 */
function getArgsFromFunc(fn = '') { 
  // reference from angular
  const ARROW_ARG = /^([^\(]+?)=>/; 
  const FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m; 
  const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg; 
  const fnText = fn.toString().replace(STRIP_COMMENTS, '');
  let args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS) || []; 
  if(args.length) {  
    args = args[1].split(',').map(arg => arg.toString().trim());
  }
  return args; 
}

/**
 * 对象转map
 * @param {object} obj 
 */
function objToMap(obj) {
  const map = new Map();
  for (const k of Object.keys(obj)) {
    map.set(k, obj[k]);
  }
  return map;
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

/**
 * 获取区间的随机整数
 */
function numRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 生成可用是端口号
 */
async function getPort() {
  let port = process.env.PORT;
  if(!port) {
    try{
      port = await portfinder.getPortPromise();
    }catch(e){
      port = numRange(1024, 65535);
    }
  } 
  
  return port;
  
}

const _util = {
  cwd, // 获取执行目录，根目录
  hasYarn,
  numRange,
  resolvePkg,
  getArgType,
  getHomedir,
  createExecCmd,
  getArgsFromFunc,
  objToMap,
  getPort
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