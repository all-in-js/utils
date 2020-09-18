'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var c = require('chalk');
var fse = require('fs-extra');
var fetch = require('node-fetch');
var normalizePath = require('normalize-path');
var portfinder = require('portfinder');
var path = require('path');
var execa = require('execa');
var os = require('os');
var child_process = require('child_process');
var traverse = require('@babel/traverse');
var generate = require('@babel/generator');
var parser = require('@babel/parser');
var types = require('@babel/types');
var ora = require('ora');
var C = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

function _interopNamespace(e) {
  if (e && e.__esModule) { return e; } else {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        n[k] = e[k];
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }
}

var c__default = /*#__PURE__*/_interopDefaultLegacy(c);
var c__namespace = /*#__PURE__*/_interopNamespace(c);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var fse__namespace = /*#__PURE__*/_interopNamespace(fse);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var fetch__namespace = /*#__PURE__*/_interopNamespace(fetch);
var normalizePath__default = /*#__PURE__*/_interopDefaultLegacy(normalizePath);
var portfinder__default = /*#__PURE__*/_interopDefaultLegacy(portfinder);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var execa__default = /*#__PURE__*/_interopDefaultLegacy(execa);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var traverse__default = /*#__PURE__*/_interopDefaultLegacy(traverse);
var generate__default = /*#__PURE__*/_interopDefaultLegacy(generate);
var types__default = /*#__PURE__*/_interopDefaultLegacy(types);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var C__default = /*#__PURE__*/_interopDefaultLegacy(C);

(function (Types) {
    Types["info"] = "info";
    Types["warn"] = "warn";
    Types["error"] = "error";
    Types["done"] = "done";
})(exports.Types || (exports.Types = {}));
const logTypeMap = {
    [exports.Types.info]: ['bgCyan', ''],
    [exports.Types.warn]: ['bgYellow', 'yellow'],
    [exports.Types.error]: ['bgRed', 'red'],
    [exports.Types.done]: ['bgGreen', '']
};
const cTag = (tag) => tag ? c__default.magenta(`${tag}`) : '';
const cType = (bg, type) => c__default[bg].black(` ${type.toUpperCase()} `);
const createLogFn = (logType) => {
    return function (msg, tag) {
        const [bg, color] = logTypeMap[logType];
        const agrs = [
            cType(bg, logType)
        ];
        const hasTag = cTag(tag);
        if (hasTag) {
            agrs.push(hasTag);
        }
        agrs.push(color ? c__default[color](msg) : msg);
        console.log(...agrs);
    };
};
const log = {
    [exports.Types.info]: createLogFn(exports.Types.info),
    [exports.Types.warn]: createLogFn(exports.Types.warn),
    [exports.Types.error]: createLogFn(exports.Types.error),
    [exports.Types.done]: createLogFn(exports.Types.done),
};
// type tag? msg
// log.info('info...', 'lint');
// log.warn('warn...', 'lint');
// log.error('error...', 'lint');
// log.done('success...', 'init');
// log.success('s');

(function (AgrsTypes) {
    AgrsTypes["isArray"] = "isArray";
    AgrsTypes["isBoolean"] = "isBoolean";
    AgrsTypes["isNumber"] = "isNumber";
    AgrsTypes["isObject"] = "isObject";
    AgrsTypes["isPromise"] = "isPromise";
    AgrsTypes["isString"] = "isString";
    AgrsTypes["isMap"] = "isMap";
    AgrsTypes["isRegExp"] = "isRegExp";
    AgrsTypes["isSet"] = "isSet";
    AgrsTypes["isWeakmap"] = "isWeakmap";
    AgrsTypes["isWeakset"] = "isWeakset";
    AgrsTypes["isSymbol"] = "isSymbol";
    AgrsTypes["isNull"] = "isNull";
    AgrsTypes["isUndefined"] = "isUndefined";
    AgrsTypes["isFunction"] = "isFunction";
})(exports.AgrsTypes || (exports.AgrsTypes = {}));
function compareAgrsType(a, b) {
    return a.replace(/^is/i, '').toLowerCase() === b;
}
/**
 * 优雅的判断参数类型
 */
function getArgType(agr) {
    const type = Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
    const obj = {
        isArray: compareAgrsType(exports.AgrsTypes.isArray, type),
        isBoolean: compareAgrsType(exports.AgrsTypes.isArray, type),
        isNumber: compareAgrsType(exports.AgrsTypes.isArray, type),
        isObject: compareAgrsType(exports.AgrsTypes.isArray, type),
        isPromise: compareAgrsType(exports.AgrsTypes.isArray, type),
        isString: compareAgrsType(exports.AgrsTypes.isArray, type),
        isMap: compareAgrsType(exports.AgrsTypes.isArray, type),
        isRegExp: compareAgrsType(exports.AgrsTypes.isArray, type),
        isSet: compareAgrsType(exports.AgrsTypes.isArray, type),
        isWeakmap: compareAgrsType(exports.AgrsTypes.isArray, type),
        isWeakset: compareAgrsType(exports.AgrsTypes.isArray, type),
        isSymbol: compareAgrsType(exports.AgrsTypes.isArray, type),
        isNull: compareAgrsType(exports.AgrsTypes.isArray, type),
        isUndefined: compareAgrsType(exports.AgrsTypes.isArray, type),
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
function getArgsFromFunc(fn) {
    // reference from angular
    const ARROW_ARG = /^([^\(]+?)=>/;
    const FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const fnText = fn.toString().replace(STRIP_COMMENTS, '');
    let args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS) || [];
    if (args.length) {
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
    let hasYarn = false;
    try {
        child_process.execSync('yarn -v');
        hasYarn = true;
    }
    catch (e) {
        hasYarn = false;
    }
    return hasYarn;
}
// execCmd([cmd])([agruments]);
const createExecCmd = (type, tip) => (cmd) => (agrs) => {
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
    return execa__default.sync(type, agrs);
};
/**
 * 获取区间的随机整数
 */
function numRange(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * 生成可用的端口号
 */
async function getPort() {
    let port = Number(process.env.PORT);
    if (!port) {
        try {
            port = await portfinder__default.getPortPromise();
        }
        catch (e) {
            port = numRange(1024, 65535);
        }
    }
    return port;
}
const resolve = normalizePathFn('resolve');
const join = normalizePathFn('join');
function resolveCWD(...target) {
    target.unshift(cwd);
    return _util.resolve(target);
}
function resolveHome(...target) {
    target.unshift(getHomedir());
    return _util.resolve(target);
}
function joinCWD(...target) {
    target.unshift(cwd);
    return _util.join(target);
}
function joinHome(...target) {
    target.unshift(getHomedir());
    return _util.join(target);
}
/**
 * 获取不同平台的home目录
 */
function getHomedir() {
    return (typeof os__default.homedir == 'function' ? os__default.homedir() :
        process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']) || '~';
}
/**
 * 兼容windows和linux的文件路径格式化
 */
function normalizePathFn(method) {
    return function (...agrs) {
        return normalizePath__default(path__default[method](...agrs));
    };
}
/**
 * 获取项目根目录的package.json，如果有lerna.json的话，会合并到一起
 */
function resolvePkg() {
    let pkg = {};
    let lernaJson = {};
    try {
        pkg = require(_util.resolveCWD('package.json'));
    }
    catch (e) {
        log.error(e);
        process.exit(0);
    }
    try {
        lernaJson = require(_util.resolveCWD('lerna.json'));
    }
    catch (e) { }
    return { ...pkg, ...lernaJson };
}
const cwd = process.cwd();
const _util = {
    cwd,
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
};

/**
 * AST操作, 节点操作时需要收集数据的话，可以将数据挂到extra对象上
 * @param {string} filepath 文件路径
 * @param {function} visitorCreater visitor生成函数
 * visitorCreater：({
 *   types,
 *   traverse,
 *   generate,
 *   parse
 * }, extra) => { code, extra }
 * @returns {object} 返回新生成的code和extra信息
 */
function astCtrl(filepath, visitorCreater) {
    if (!fse__default.existsSync(filepath)) {
        log.error(`can not resolve the filepath: ${filepath}`, 'astCtrl');
        process.exit();
    }
    const extra = {};
    const codes = fse__default.readFileSync(filepath).toString();
    if (!getArgType(visitorCreater).isFunction) {
        log.error(`'visitorCreater' should be a function`, 'astCtrl');
        process.exit();
    }
    const _babel = {
        types: types__default,
        traverse: traverse__default,
        generate: generate__default,
        parse: parser.parse
    };
    const visitor = visitorCreater(_babel, extra);
    if (!getArgType(visitor).isObject) {
        log.error(`expect 'visitorCreater' return an Object`, 'astCtrl');
        process.exit();
    }
    const ast = parser.parse(codes, {
        sourceType: "module"
    });
    traverse__default(ast, visitor);
    const generatorOpts = {
        jsescOption: {
            minimal: true
        },
    };
    const { code } = generate__default(ast, generatorOpts, codes);
    return {
        code,
        extra: extra
    };
}

const AGRS_TIP = 'arguments of the command should be an array.';
const execCmd = createExecCmd('npm', AGRS_TIP);
const npmClient = {
    get version() {
        const { stdout } = execCmd()(['-v']);
        return stdout;
    },
    get config() {
        let conf = {
            registry: '',
            username: '',
            email: ''
        };
        try {
            const { stdout } = execCmd('config')(['list', '--json']);
            conf = JSON.parse(stdout);
        }
        catch (e) {
            console.log(e);
        }
        const registry = conf.registry;
        const uInfo = (key) => {
            return conf[(`${registry.replace(/^https?:/, '') + (registry.endsWith('/') ? '' : '/')}:${key}`)];
        };
        conf.username = uInfo('username');
        conf.email = uInfo('email');
        return conf;
    },
    setConfig(key, value) {
        execCmd('config')(['set', `${key}`, `${value}`]);
        return this.config;
    },
    addDistTag(pkg, version, tag = 'latest') {
        return this.tag.add(pkg, version, tag);
    },
    get tag() {
        return {
            list(pkg) {
                const agrs = ['list'];
                if (pkg) {
                    agrs.push(pkg);
                }
                const { stdout } = execCmd('dist-tag')(agrs);
                return stdout;
            },
            add(pkg, version, tag = 'latest') {
                const { stdout } = execCmd('dist-tag')(['add', `${pkg}@${version}`, tag]);
                return stdout;
            },
            remove(pkg, tag = 'latest') {
                const { stdout } = execCmd('dist-tag')(['rm', pkg, tag]);
                return stdout;
            }
        };
    }
};

const AGRS_TIP$1 = 'arguments of the command should be an array.';
const execCmd$1 = createExecCmd('git', AGRS_TIP$1);
(function (GitConfigLevelType) {
    GitConfigLevelType["local"] = "local";
    GitConfigLevelType["global"] = "global";
    GitConfigLevelType["system"] = "system";
})(exports.GitConfigLevelType || (exports.GitConfigLevelType = {}));
const gitClient = {
    get config() {
        // git.config.local.add(key, value);
        const config = {
            local: configCtrl(exports.GitConfigLevelType.local),
            global: configCtrl(exports.GitConfigLevelType.global),
            system: configCtrl(exports.GitConfigLevelType.system)
        };
        return config;
    },
    init(agrs) {
        return execCmd$1('init')(agrs);
    },
    add(agrs) {
        if (!agrs || !agrs.length) {
            agrs = ['.'];
        }
        execCmd$1('add')(agrs);
        return this;
    },
    commit(msg, agrs = []) {
        const { clean } = this.hasChanges;
        if (clean)
            return this;
        assertAgrs(!getArgType(agrs).isArray, AGRS_TIP$1);
        if (msg) {
            execCmd$1('commit')(['-m', msg].concat(agrs));
        }
        else {
            assertAgrs(true, 'please commit with some message.');
        }
        return this;
    },
    commitAll(msg, agrs) {
        return this.add().commit(msg, agrs);
    },
    status(agrs) {
        const { stdout } = execCmd$1('status')(agrs);
        return {
            clean: !!!stdout,
            files: stdout
        };
    },
    get hasChanges() {
        return this.status(['--porcelain']);
    },
    checkClean(tag) {
        const { clean, files } = this.hasChanges;
        if (!clean) {
            log.error(`git tree not clean: \n${files}`, tag);
            process.exit(0);
        }
    },
    fetch(agrs) {
        if (!agrs) {
            agrs = [];
        }
        assertAgrs(!getArgType(agrs).isArray, AGRS_TIP$1);
        this.checkClean('git fetch');
        const pullAgrs = [this.defaultRemote, this.currentBranch].concat(agrs);
        execCmd$1('fetch')(pullAgrs);
    },
    pull(agrs) {
        if (!agrs) {
            agrs = [];
        }
        assertAgrs(!getArgType(agrs).isArray, AGRS_TIP$1);
        this.checkClean('git pull');
        const hasRemoteBranch = this.branches.includes(`remotes/${this.remoteAndBranch}`);
        if (hasRemoteBranch) {
            const pullAgrs = [this.defaultRemote, this.currentBranch].concat(agrs);
            try {
                execCmd$1('pull')(pullAgrs);
            }
            catch (e) {
                // conflict
                console.log(e.message);
                process.exit(0);
            }
        }
        else {
            log.warn(`couldn't find remote ref`, this.currentBranch);
        }
    },
    push(remote, branch, agrs) {
        if (!branch && !agrs && getArgType(remote).isArray) {
            agrs = remote;
        }
        if (!agrs) {
            agrs = [];
        }
        assertAgrs(!getArgType(agrs).isArray, AGRS_TIP$1);
        this.checkClean('git push');
        const pushAgrs = [remote || this.defaultRemote, branch || this.currentBranch];
        execCmd$1('push')(pushAgrs.concat(agrs));
    },
    log(agrs) {
        const { stdout } = execCmd$1('log')(agrs);
        return stdout;
    },
    merge(agrs) {
        execCmd$1('merge')(agrs);
    },
    get branch() {
        return {
            has: (name) => {
                return this.branches.includes(name);
            },
            add: (name, base) => {
                if (!name)
                    return;
                const agrs = ['-b', name];
                if (base) {
                    agrs.push(base);
                }
                execCmd$1('checkout')(agrs);
            },
            switch: (name) => {
                execCmd$1('checkout')([name]);
            },
            removeLocal: (name) => {
                execCmd$1('branch')(['-D', name]);
            },
            removeRemote: (name) => {
                execCmd$1('push')([this.defaultRemote, '-d', name]);
            }
        };
    },
    get maybePull() {
        const [behind] = this.behindAndAhead;
        return Boolean(behind);
    },
    get behindAndAhead() {
        this.remote.update(this.defaultRemote);
        const { stdout } = execCmd$1('rev-list')(["--left-right", "--count", `${this.remoteAndBranch}...${this.currentBranch}`]);
        return stdout.split("\t").map(val => parseInt(val, 10));
    },
    get remote() {
        const remoteCtrl = execCmd$1('remote');
        const $this = this;
        return {
            update: (name) => remoteCtrl(['update'].concat(name || [])),
            add: (name, url, agrs = []) => remoteCtrl(['add', ...agrs, name, url]),
            rename: (old, newname) => remoteCtrl(['rename', old, newname]),
            remove: (name) => remoteCtrl(['remove', name]),
            setUrl: (name, newurl) => remoteCtrl(['set-url', name, newurl]),
            getUrl: (name) => remoteCtrl(['get-url', name]),
            get list() {
                return $this.remotes;
            }
        };
    },
    newTag(name) {
        this.tag.add(name).push(name.name || name);
    },
    get tag() {
        const tagCtrl = execCmd$1('tag');
        const gitTag = {
            get list() {
                let list = [];
                const { stdout, failed } = tagCtrl();
                if (!failed) {
                    list = splitOut(stdout);
                }
                return list;
            },
            filter: (pattern) => {
                let list = [];
                const { stdout, failed } = tagCtrl(['-l', pattern]);
                if (!failed) {
                    list = splitOut(stdout);
                }
                return list;
            },
            add: (opts = '') => {
                const agrsType = getArgType(opts);
                const exists = (name) => this.tag.list.includes(name);
                if (agrsType.isString) {
                    if (exists(opts))
                        return gitTag;
                    tagCtrl([opts]);
                }
                else if (agrsType.isObject) {
                    if (exists(opts.name))
                        return gitTag;
                    const { name, msg, commit } = opts || {};
                    let agrs = [];
                    if (name) {
                        agrs = agrs.concat(['-a', name]);
                    }
                    if (msg) {
                        agrs = agrs.concat(['-m', msg]);
                    }
                    if (commit) {
                        agrs.push(commit);
                    }
                    tagCtrl(agrs);
                }
                return gitTag;
            },
            show(name) {
                const { stdout, failed } = execCmd$1('show')([name]);
                if (!failed) {
                    return stdout;
                }
                return '';
            },
            push: (name) => {
                execCmd$1('push')([this.defaultRemote, name]);
            }
        };
        return gitTag;
    },
    get branches() {
        const { stdout } = execCmd$1('branch')(['-a']);
        return splitOut(stdout).map(str => str.trim());
    },
    get mayHaveConflict() {
        const hasRemoteBranch = this.branches.includes(`remotes/${this.remoteAndBranch}`);
        if (hasRemoteBranch) {
            const preCommit = this.currRemoteCommit;
            this.fetch();
            const newCommit = this.currRemoteCommit;
            return preCommit !== newCommit;
        }
        else {
            return false;
        }
    },
    get remoteAndBranch() {
        return `${this.defaultRemote}/${this.currentBranch}`;
    },
    get currRemoteCommit() {
        return splitOut(this.log([this.remoteAndBranch, '--pretty=format:%h']))[0];
    },
    get remotes() {
        return splitOut(execCmd$1('remote')(['-v']).stdout)
            .filter(item => item.endsWith('(fetch)'))
            .map(item => {
            const values = item.split('\t');
            values[1] = values[1].replace(/\s+\(fetch\)$/, '');
            return values;
        });
    },
    get defaultRemote() {
        let defaultRemote = '';
        const remotes = this.remotes;
        if (remotes.length) {
            defaultRemote = remotes[0][0];
        }
        return defaultRemote;
    },
    get currentBranch() {
        const { stdout: branch } = execCmd$1('symbolic-ref')(['--short', 'HEAD']);
        return branch;
    }
};
// const { stdout } = git.addAll().commit('msg').push();
// console.log(gitClient.defaultRemote);
// const a = gitClient.currRemoteCommit;
// console.log(a);
// gitClient.fetch();
// console.log(gitClient.log(['--pretty=format:%H']).split(/[\r\n]/)[0]);
// const b = gitClient.tag.list;
// console.log(b);
// console.log(gitClient.newTag('v1.0.3'))
// console.log(gitClient.config.local.list);
function configCtrl(level) {
    return {
        add(key, value) {
            return execCmd$1('config')([`--${level}`, key, value]);
        },
        get(key) {
            return execCmd$1('config')([`--${level}`, key]);
        },
        remove(key) {
            return execCmd$1('config')([`--${level}`, '--unset', key]);
        },
        get list() {
            const { stdout, failed } = execCmd$1('config')([`--${level}`, '-l']);
            if (!failed) {
                return splitOut(stdout);
            }
            else {
                return [];
            }
        }
    };
}
function assertAgrs(bool, msg) {
    if (bool) {
        log.error(msg, 'git');
        process.exit(0);
    }
}
function splitOut(stdout = '') {
    return stdout.toString().trim().split(/[\r\n]/);
}

// 不能和同步的child_process方法一起使用
// 使用promise的execa和await
class Spinner {
    constructor(options) {
        this._spinner = ora__default(options).start();
    }
    step(txt) {
        this._spinner.text = txt;
    }
    clear() {
        this._spinner.clear();
        return this._spinner;
    }
    stop() {
        this._spinner.clear().stop();
    }
    succeed(txt) {
        this._spinner.clear().succeed(txt);
    }
    fail(txt) {
        this._spinner.clear().fail(txt);
    }
}

class DDWebhook {
    constructor(option) {
        const { secret, webhook } = option;
        if (!secret || !webhook) {
            log.error('secret or webhook excepted!');
            process.exit(1);
        }
        this.secret = secret;
        this.webhook = webhook;
        this.timestamp = Date.now();
    }
    createSignature() {
        const stringToSign = `${this.timestamp}\n${this.secret}`;
        const hmac = C__default.createHmac('sha256', this.secret);
        hmac.update(stringToSign, 'utf8');
        const sign = encodeURIComponent(hmac.digest('base64'));
        return sign;
    }
    sendMessage(body) {
        const openapi = `${this.webhook}&sign=${this.createSignature()}&timestamp=${this.timestamp}`;
        return fetch__default(openapi, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json());
    }
}
// const secret = 'SEC...';
// const webhook = 'webhook...';
// new DDWebhook({
//   secret,
//   webhook
// }).sendMessage({
//   msgtype: "text", 
//   text: {
//     content: '测试用'
//   }
// })
// .then(console.log)
// .catch(console.log);

exports.c = c__namespace;
exports.fse = fse__namespace;
exports.fetch = fetch__namespace;
exports.DDWebhook = DDWebhook;
exports.Spinner = Spinner;
exports.astCtrl = astCtrl;
exports.createExecCmd = createExecCmd;
exports.cwd = cwd;
exports.getArgType = getArgType;
exports.getArgsFromFunc = getArgsFromFunc;
exports.getHomedir = getHomedir;
exports.gitClient = gitClient;
exports.hasYarn = hasYarn;
exports.join = join;
exports.joinCWD = joinCWD;
exports.joinHome = joinHome;
exports.log = log;
exports.normalizePathFn = normalizePathFn;
exports.npmClient = npmClient;
exports.objToMap = objToMap;
exports.resolve = resolve;
exports.resolveCWD = resolveCWD;
exports.resolveHome = resolveHome;
exports.resolvePkg = resolvePkg;
