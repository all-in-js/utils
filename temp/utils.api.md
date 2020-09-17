## API Report File for "@iuv-tools/utils"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import * as c from 'chalk';
import execa from 'execa';
import generate from '@babel/generator';
import { Options } from 'ora';
import { Ora } from 'ora';
import ora from 'ora';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import types from '@babel/types';
import { Visitor } from '@babel/traverse';

// Warning: (ae-forgotten-export) The symbol "ExtraType" needs to be exported by the entry point index.d.ts
//
// @public
export function astCtrl<T extends ExtraType>(filepath: string, visitorCreater: VisitorCreaterType<T>): {
    code: string;
    extra: T;
};

export { c }

// @public (undocumented)
export const createExecCmd: (type: string, tip: string) => (cmd?: string | undefined) => (agrs?: string[] | undefined) => execa.ExecaSyncReturnValue<string>;

// @public (undocumented)
export const cwd: string;

// Warning: (ae-forgotten-export) The symbol "TextType" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "LinkType" needs to be exported by the entry point index.d.ts
// Warning: (ae-forgotten-export) The symbol "MarkdownType" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export type DDMessageType = TextType | LinkType | MarkdownType;

// @public (undocumented)
export class DDWebhook {
    // Warning: (ae-forgotten-export) The symbol "Option" needs to be exported by the entry point index.d.ts
    constructor(option: Option_2);
    // (undocumented)
    createSignature(): string;
    // (undocumented)
    secret: string;
    // (undocumented)
    sendMessage(body: DDMessageType): Promise<any>;
    // (undocumented)
    timestamp: number;
    // (undocumented)
    webhook: string;
}

// @public
export function getArgsFromFunc(fn: Function): string[];

// Warning: (ae-forgotten-export) The symbol "AgrsTyped" needs to be exported by the entry point index.d.ts
//
// @public
export function getArgType(agr: any): AgrsTyped;

// @public
export function getHomedir(): string;

// @public (undocumented)
export const gitClient: GitClientType;

// @public (undocumented)
export interface GitClientType {
    // (undocumented)
    add: (agrs?: string[]) => GitClientType;
    // (undocumented)
    readonly behindAndAhead: number[];
    // Warning: (ae-forgotten-export) The symbol "GitBranchType" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly branch: GitBranchType;
    // (undocumented)
    readonly branches: string[];
    // (undocumented)
    checkClean: (tag: string) => void;
    // (undocumented)
    commit: (msg: string, agrs: string[]) => GitClientType;
    // (undocumented)
    commitAll: (msg: string, agrs: string[]) => GitClientType;
    // Warning: (ae-forgotten-export) The symbol "GitConfigType" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly config: GitConfigType;
    // (undocumented)
    readonly currentBranch: string;
    // (undocumented)
    readonly currRemoteCommit: string;
    // (undocumented)
    readonly defaultRemote: string;
    // (undocumented)
    fetch: (agrs?: string[]) => void;
    // Warning: (ae-forgotten-export) The symbol "GitStatusType" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly hasChanges: GitStatusType;
    // Warning: (ae-forgotten-export) The symbol "ExecaResType" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    init: (agrs: string[]) => ExecaResType;
    // (undocumented)
    log: (agrs: string[]) => string;
    // (undocumented)
    readonly maybePull: boolean;
    // (undocumented)
    readonly mayHaveConflict: boolean;
    // (undocumented)
    merge: (agrs: string[]) => void;
    // (undocumented)
    newTag: (name: string) => void;
    // (undocumented)
    pull: (agrs?: string[]) => void;
    // (undocumented)
    push: (remote?: string, branch?: string, agrs?: string[]) => void;
    // Warning: (ae-forgotten-export) The symbol "GitRemoteType" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly remote: GitRemoteType;
    // (undocumented)
    readonly remoteAndBranch: string;
    // (undocumented)
    readonly remotes: string[][];
    // (undocumented)
    status: (agrs: string[]) => GitStatusType;
    // Warning: (ae-forgotten-export) The symbol "GitTagType" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly tag: GitTagType;
}

// @public
export function hasYarn(): boolean;

// @public (undocumented)
export const join: Function;

// @public (undocumented)
export function joinCWD(...target: string[]): string;

// @public (undocumented)
export function joinHome(...target: string[]): string;

// Warning: (ae-forgotten-export) The symbol "LogType" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export const log: LogType;

// @public (undocumented)
export interface NmpClientType {
    // (undocumented)
    addDistTag: NpmTagType['add'];
    // Warning: (ae-forgotten-export) The symbol "NpmConfig" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly config: NpmConfig;
    // (undocumented)
    setConfig: (key: string, value: string) => NpmConfig;
    // Warning: (ae-forgotten-export) The symbol "NpmTagType" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly tag: NpmTagType;
    // (undocumented)
    readonly version: string;
}

// @public
export function normalizePathFn(method: 'resolve' | 'join'): Function;

// @public (undocumented)
export const npmClient: NmpClientType;

// Warning: (ae-forgotten-export) The symbol "ObjType" needs to be exported by the entry point index.d.ts
//
// @public
export function objToMap(obj: ObjType): Map<string | number, any>;

// @public (undocumented)
export const resolve: Function;

// @public (undocumented)
export function resolveCWD(...target: string[]): string;

// @public (undocumented)
export function resolveHome(...target: string[]): string;

// @public
export function resolvePkg(): object;

// @public (undocumented)
export class Spinner {
    constructor(options: Options | string);
    // (undocumented)
    clear(): ora.Ora;
    // (undocumented)
    fail(txt: string): void;
    // (undocumented)
    _spinner: Ora;
    // (undocumented)
    step(txt: string): void;
    // (undocumented)
    stop(): void;
    // (undocumented)
    succeed(txt: string): void;
}

// @public (undocumented)
export interface UtilType {
    // (undocumented)
    createExecCmd: (type: string, tip: string) => (cmd?: string) => (agrs?: string[]) => execa.ExecaSyncReturnValue | execa.ExecaSyncReturnValue<Buffer>;
    // (undocumented)
    readonly cwd: string;
    // (undocumented)
    getArgsFromFunc: (agrs: Function) => string[];
    // (undocumented)
    getArgType: (agrs: any) => AgrsTyped;
    // (undocumented)
    getHomedir: () => string;
    // (undocumented)
    getPort: () => Promise<number>;
    // (undocumented)
    hasYarn: () => boolean;
    // (undocumented)
    join: Function;
    // (undocumented)
    joinCWD: (...agrs: string[]) => string;
    // (undocumented)
    joinHome: (...agrs: string[]) => string;
    // (undocumented)
    numRange: (min: number, max: number) => number;
    // (undocumented)
    objToMap: (agrs: ObjType) => Map<string | number, any>;
    // (undocumented)
    resolve: Function;
    // (undocumented)
    resolveCWD: (...agrs: string[]) => string;
    // (undocumented)
    resolveHome: (...agrs: string[]) => string;
    // (undocumented)
    resolvePkg: () => object;
}

// Warning: (ae-forgotten-export) The symbol "CbBabelType" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export type VisitorCreaterType<T extends ExtraType> = (_babel: CbBabelType, extra: T) => Visitor;


// (No @packageDocumentation comment for this package)

```