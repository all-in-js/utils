/// <reference types="babel__traverse" />
/// <reference types="node" />
import * as c from 'chalk';
import execa from 'execa';
import * as fetch_2 from 'node-fetch';
import * as fse from 'fs-extra';
import generate from '@babel/generator';
import { Options } from 'ora';
import { Ora } from 'ora';
import ora from 'ora';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import types from '@babel/types';
import { Visitor } from '@babel/traverse';

export declare type AgrsTyped = {
    [key in AgrsTypes]: boolean;
};

export declare enum AgrsTypes {
    isArray = "isArray",
    isBoolean = "isBoolean",
    isNumber = "isNumber",
    isObject = "isObject",
    isPromise = "isPromise",
    isString = "isString",
    isMap = "isMap",
    isRegExp = "isRegExp",
    isSet = "isSet",
    isWeakmap = "isWeakmap",
    isWeakset = "isWeakset",
    isSymbol = "isSymbol",
    isNull = "isNull",
    isUndefined = "isUndefined",
    isFunction = "isFunction"
}

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
export declare function astCtrl<T extends ExtraType>(filepath: string, visitorCreater: VisitorCreaterType<T>): {
    code: string;
    extra: T;
};

export declare type At = {
    atMobiles: string[];
    isAtAll: boolean;
};
export { c }

export declare interface CbBabelType {
    types: typeof types;
    traverse: typeof traverse;
    generate: typeof generate;
    parse: typeof parse;
}

export declare const createExecCmd: (type: string, tip: string) => (cmd?: string | undefined) => (agrs?: string[] | undefined) => execa.ExecaSyncReturnValue<string>;

export declare const cwd: string;

export declare type DDMessageType = TextType | LinkType | MarkdownType;

export declare class DDWebhook {
    secret: string;
    webhook: string;
    timestamp: number;
    constructor(option: Option_2);
    createSignature(): string;
    sendMessage(body: DDMessageType): Promise<any>;
}

export declare type ExecaResType = execa.ExecaSyncReturnValue | execa.ExecaSyncReturnValue<Buffer>;

export declare interface ExtraType {
    [key: string]: any;
}
export { fetch_2 as fetch }
export { fse }

/**
 * 解析函数的参数名
 * @param {function} fn
 * @example
 * getArgsFromFunc($a, $b)
 * => ['$a', '$b']
 */
export declare function getArgsFromFunc(fn: Function): string[];

/**
 * 优雅的判断参数类型
 */
export declare function getArgType(agr: any): AgrsTyped;

/**
 * 获取不同平台的home目录
 */
export declare function getHomedir(): string;

export declare type GitBranchType = {
    has: (name: string) => boolean;
    add: (name: string, base: string) => void;
    switch: (name: string) => void;
    removeLocal: (name: string) => void;
    removeRemote: (name: string) => void;
};

export declare const gitClient: GitClientType;

export declare interface GitClientType {
    readonly config: GitConfigType;
    readonly hasChanges: GitStatusType;
    readonly branch: GitBranchType;
    readonly remote: GitRemoteType;
    readonly tag: GitTagType;
    readonly remotes: string[][];
    readonly branches: string[];
    readonly defaultRemote: string;
    readonly currentBranch: string;
    readonly remoteAndBranch: string;
    readonly maybePull: boolean;
    readonly behindAndAhead: number[];
    readonly currRemoteCommit: string;
    readonly mayHaveConflict: boolean;
    status: (agrs: string[]) => GitStatusType;
    init: (agrs: string[]) => ExecaResType;
    add: (agrs?: string[]) => GitClientType;
    commit: (msg: string, agrs: string[]) => GitClientType;
    commitAll: (msg: string, agrs: string[]) => GitClientType;
    checkClean: (tag: string) => void;
    fetch: (agrs?: string[]) => void;
    pull: (agrs?: string[]) => void;
    push: (remote?: string, branch?: string, agrs?: string[]) => void;
    log: (agrs: string[]) => string;
    merge: (agrs: string[]) => void;
    newTag: (name: string) => void;
}

export declare enum GitConfigLevelType {
    local = "local",
    global = "global",
    system = "system"
}

export declare interface GitConfigObjType {
    add: (key: string, value: string) => ExecaResType;
    get: (key: string) => ExecaResType;
    remove: (key: string) => ExecaResType;
    readonly list: string[];
}

export declare type GitConfigType = {
    [key in GitConfigLevelType]: GitConfigObjType;
};

export declare type GitRemoteType = {
    update: (name: string) => ExecaResType;
    add: (name: string, url: string, agrs: string[]) => ExecaResType;
    rename: (old: string, newname: string) => ExecaResType;
    remove: (name: string) => ExecaResType;
    setUrl: (name: string, newurl: string) => ExecaResType;
    getUrl: (name: string) => ExecaResType;
    readonly list: string[][];
};

export declare type GitStatusType = {
    clean: boolean;
    files: string;
};

export declare type GitTagAddOption = {
    name: string;
    msg: string;
    commit: string;
};

export declare type GitTagType = {
    readonly list: string[];
    filter: (pattern: string) => string[];
    add: (opts: string | GitTagAddOption) => GitTagType;
    show: (name: string) => string;
    push: (name: string) => void;
};

/**
 * 是否支持yarn
 */
export declare function hasYarn(): boolean;

export declare const join: Function;

export declare function joinCWD(...target: string[]): string;

export declare function joinHome(...target: string[]): string;

/**
 * link类型
 */
export declare type LinkObj = {
    text: string;
    title: string;
    messageUrl: string;
    picUrl?: string;
};

export declare interface LinkType extends MsgType {
    link: LinkObj;
}

export declare const log: LogType;

export declare type LogFnType = (msg: any, tag?: string) => void;

export declare interface LogType {
    [Types.info]: LogFnType;
    [Types.warn]: LogFnType;
    [Types.error]: LogFnType;
    [Types.done]: LogFnType;
}

/**
 * markdown类型
 */
export declare type Markdown = {
    title: string;
    text: string;
};

export declare interface MarkdownType extends MsgType {
    markdown: Markdown;
    at: At;
}

/**
 * 基础消息类型
 */
export declare interface MsgType {
    msgtype: string;
}

export declare interface NmpClientType {
    readonly version: string;
    readonly config: NpmConfig;
    readonly tag: NpmTagType;
    setConfig: (key: string, value: string) => NpmConfig;
    addDistTag: NpmTagType['add'];
}

/**
 * 兼容windows和linux的文件路径格式化
 */
export declare function normalizePathFn(method: 'resolve' | 'join'): Function;

export declare const npmClient: NmpClientType;

export declare type NpmConfig = {
    registry: string;
    username: string;
    email: string;
};

export declare type NpmTagType = {
    list: (pkg: string) => string;
    add: (pkg: string, version: string, tag: string) => string;
    remove: (pkg: string, tag: string) => string;
};

/**
 * 对象转map
 * @param {object} obj
 */
export declare function objToMap(obj: ObjType): Map<string | number, any>;

export declare type ObjType = {
    [key in string | number]: any;
};

declare interface Option_2 {
    secret: string;
    webhook: string;
}
export { Option_2 as Option }

export declare const resolve: Function;

export declare function resolveCWD(...target: string[]): string;

export declare function resolveHome(...target: string[]): string;

/**
 * 获取项目根目录的package.json，如果有lerna.json的话，会合并到一起
 */
export declare function resolvePkg(): object;

export declare class Spinner {
    _spinner: Ora;
    constructor(options: Options | string);
    step(txt: string): void;
    clear(): ora.Ora;
    stop(): void;
    succeed(txt: string): void;
    fail(txt: string): void;
}

/**
 * text类型
 */
export declare type TextContent = {
    content: string;
};

export declare interface TextType extends MsgType {
    text: TextContent;
    at: At;
}

export declare enum Types {
    info = "info",
    warn = "warn",
    error = "error",
    done = "done"
}

export declare interface UtilType {
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
    join: Function;
    resolveCWD: (...agrs: string[]) => string;
    resolveHome: (...agrs: string[]) => string;
    joinCWD: (...agrs: string[]) => string;
    joinHome: (...agrs: string[]) => string;
}

export declare type VisitorCreaterType<T extends ExtraType> = (_babel: CbBabelType, extra: T) => Visitor;

export { }
