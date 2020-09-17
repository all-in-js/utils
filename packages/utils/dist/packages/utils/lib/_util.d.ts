/// <reference types="node" />
import execa from 'execa';
declare enum AgrsTypes {
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
declare type AgrsTyped = {
    [key in AgrsTypes]: boolean;
};
declare type ObjType = {
    [key in string | number]: any;
};
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
    join: Function;
    resolveCWD: (...agrs: string[]) => string;
    resolveHome: (...agrs: string[]) => string;
    joinCWD: (...agrs: string[]) => string;
    joinHome: (...agrs: string[]) => string;
}
/**
 * 优雅的判断参数类型
 */
export declare function getArgType(agr: any): AgrsTyped;
/**
 * 解析函数的参数名
 * @param {function} fn
 * @example
 * getArgsFromFunc($a, $b)
 * => ['$a', '$b']
 */
export declare function getArgsFromFunc(fn: Function): string[];
/**
 * 对象转map
 * @param {object} obj
 */
export declare function objToMap(obj: ObjType): Map<string | number, any>;
/**
 * 是否支持yarn
 */
export declare function hasYarn(): boolean;
export declare const createExecCmd: (type: string, tip: string) => (cmd?: string | undefined) => (agrs?: string[] | undefined) => execa.ExecaSyncReturnValue<string>;
export declare const resolve: Function;
export declare const join: Function;
export declare function resolveCWD(...target: string[]): string;
export declare function resolveHome(...target: string[]): string;
export declare function joinCWD(...target: string[]): string;
export declare function joinHome(...target: string[]): string;
/**
 * 获取不同平台的home目录
 */
export declare function getHomedir(): string;
/**
 * 兼容windows和linux的文件路径格式化
 */
export declare function normalizePathFn(method: 'resolve' | 'join'): Function;
/**
 * 获取项目根目录的package.json，如果有lerna.json的话，会合并到一起
 */
export declare function resolvePkg(): object;
export declare const cwd: string;
declare const _util: UtilType;
export default _util;
//# sourceMappingURL=_util.d.ts.map