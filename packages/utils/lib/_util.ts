import normalizePath from 'normalize-path';
import portfinder from 'portfinder';
import path from 'path';
import execa from 'execa';
import os from 'os';
import { execSync } from 'child_process';

import log from './log';

enum AgrsTypes {
  isArray = 'isArray',
  isBoolean = 'isBoolean',
  isNumber = 'isNumber',
  isObject = 'isObject',
  isPromise = 'isPromise',
  isString = 'isString',
  isMap = 'isMap',
  isRegExp = 'isRegExp',
  isSet = 'isSet',
  isWeakmap = 'isWeakmap',
  isWeakset = 'isWeakset',
  isSymbol = 'isSymbol',
  isNull = 'isNull',
  isUndefined = 'isUndefined',
  isFunction = 'isFunction'
}

type AgrsTyped = {
  [key in AgrsTypes]: boolean;
}

type ObjType = {
  [key in string | number]: any;
}

export interface UtilType {
  readonly cwd: string;
  hasYarn: () => boolean;
  numRange: (min: number, max: number) => number;
  resolvePkg: () => object;
  getArgType: (agrs: any) => AgrsTyped;
  getHomedir: () => string;
  createExecCmd: (type: string, tip: string) => (cmd?: string) => (agrs?: string[]) => execa.ExecaSyncReturnValue | execa.ExecaSyncReturnValue<Buffer>;
  getArgsFromFunc: (agrs: Function) => string[];
  objToMap: (agrs: ObjType) => Map<string | number, any>;
  getPort: () => Promise<number>;
  resolve: Function;
  join: Function,
  resolveCWD: (...agrs: string[]) => string;
  resolveHome: (...agrs: string[]) => string;
  joinCWD: (...agrs: string[]) => string;
  joinHome: (...agrs: string[]) => string;
}

function compareAgrsType(a: string, b: string): boolean {
  return a.replace(/^is/i, '').toLowerCase() === b;
}
/**
 * 优雅的判断参数类型
 */
export function getArgType(agr: any) {
  const type = Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();

  const obj: AgrsTyped = {
    isArray: compareAgrsType(AgrsTypes.isArray, type),
    isBoolean: compareAgrsType(AgrsTypes.isArray, type),
    isNumber: compareAgrsType(AgrsTypes.isArray, type),
    isObject: compareAgrsType(AgrsTypes.isArray, type),
    isPromise: compareAgrsType(AgrsTypes.isArray, type),
    isString: compareAgrsType(AgrsTypes.isArray, type),
    isMap: compareAgrsType(AgrsTypes.isArray, type),
    isRegExp: compareAgrsType(AgrsTypes.isArray, type),
    isSet: compareAgrsType(AgrsTypes.isArray, type),
    isWeakmap: compareAgrsType(AgrsTypes.isArray, type),
    isWeakset: compareAgrsType(AgrsTypes.isArray, type),
    isSymbol: compareAgrsType(AgrsTypes.isArray, type),
    isNull: compareAgrsType(AgrsTypes.isArray, type),
    isUndefined: compareAgrsType(AgrsTypes.isArray, type),
    isFunction: ['asyncfunction', 'generatorfunction', 'function'].indexOf(type) >= 0
  };
  return obj;
}

/**
 * 解析函数的参数名
 * @param {function} fn 
 * @example
 * getArgsFromFunc($a, $b)
 * => ['$a', '$b']
 */
export function getArgsFromFunc(fn: Function): string[] { 
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
export function objToMap(obj: ObjType): Map<string | number, any> {
  const map = new Map();
  for (const k of Object.keys(obj)) {
    map.set(k, obj[k]);
  }
  return map;
}

/**
 * 是否支持yarn
 */
export function hasYarn(): boolean {
  let hasYarn = false;
  try {
    execSync('yarn -v');
    hasYarn = true;
  } catch(e) {
    hasYarn = false;
  }
  return hasYarn;
}

// execCmd([cmd])([agruments]);
export const createExecCmd = (type: string, tip: string) => (cmd?: string) => (agrs?: string[]) => {
  if (!agrs) {
    agrs = [];
  }
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
function numRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 生成可用的端口号
 */
async function getPort(): Promise<number> {
  let port: number = Number(process.env.PORT);
  if(!port) {
    try {
      port = await portfinder.getPortPromise();
    } catch (e) {
      port = numRange(1024, 65535);
    }
  }
  
  return port;
  
}

export const resolve = normalizePathFn('resolve');
export const join = normalizePathFn('join');
export function resolveCWD(...target: string[]): string {
  target.unshift(cwd);
  return _util.resolve(target);
}
export function resolveHome(...target: string[]): string {
  target.unshift(getHomedir());
  return _util.resolve(target);
}
export function joinCWD(...target: string[]): string {
  target.unshift(cwd);
  return _util.join(target);
}
export function joinHome(...target: string[]): string {
  target.unshift(getHomedir());
  return _util.join(target);
}

/**
 * 获取不同平台的home目录
 */
export function getHomedir() {
  return (typeof os.homedir == 'function' ? os.homedir() :
  process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']) || '~';
}

/**
 * 兼容windows和linux的文件路径格式化
 */
export function normalizePathFn(method: 'resolve' | 'join'): Function {
  return function(...agrs: string[]): string {
    return normalizePath(path[method](...agrs));
  };
}

/**
 * 获取项目根目录的package.json，如果有lerna.json的话，会合并到一起
 */
export function resolvePkg(): object {
  let pkg = {};
  let lernaJson = {};
  try {
    pkg = require(_util.resolveCWD('package.json'));
  } catch (e) {
    log.error(e);
    process.exit(0);
  }
  try {
    lernaJson = require(_util.resolveCWD('lerna.json'));
  } catch(e) {}
  return { ...pkg, ...lernaJson };
};

export const cwd: string = process.cwd();

const _util: UtilType = {
  cwd, // 获取执行目录，根目录
  hasYarn,
  numRange,
  resolvePkg,
  getArgType,
  getHomedir,
  createExecCmd,
  getArgsFromFunc,
  objToMap,
  getPort,
  resolve,
  join,
  /**
   * 从根目录resolve
   */
  resolveCWD,
  /**
   * 从home目录resolve
   */
  resolveHome,
  /**
   * 从根目录join
   */
  joinCWD,
  /**
   * 从home目录join
   */
  joinHome
}

export default _util;