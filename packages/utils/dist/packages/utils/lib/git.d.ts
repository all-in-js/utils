/// <reference types="node" />
import execa from 'execa';
declare type ExecaResType = execa.ExecaSyncReturnValue | execa.ExecaSyncReturnValue<Buffer>;
interface GitConfigObjType {
    add: (key: string, value: string) => ExecaResType;
    get: (key: string) => ExecaResType;
    remove: (key: string) => ExecaResType;
    readonly list: string[];
}
declare enum GitConfigLevelType {
    local = "local",
    global = "global",
    system = "system"
}
declare type GitConfigType = {
    [key in GitConfigLevelType]: GitConfigObjType;
};
declare type GitStatusType = {
    clean: boolean;
    files: string;
};
declare type GitBranchType = {
    has: (name: string) => boolean;
    add: (name: string, base: string) => void;
    switch: (name: string) => void;
    removeLocal: (name: string) => void;
    removeRemote: (name: string) => void;
};
declare type GitRemoteType = {
    update: (name: string) => ExecaResType;
    add: (name: string, url: string, agrs: string[]) => ExecaResType;
    rename: (old: string, newname: string) => ExecaResType;
    remove: (name: string) => ExecaResType;
    setUrl: (name: string, newurl: string) => ExecaResType;
    getUrl: (name: string) => ExecaResType;
    readonly list: string[][];
};
declare type GitTagAddOption = {
    name: string;
    msg: string;
    commit: string;
};
declare type GitTagType = {
    readonly list: string[];
    filter: (pattern: string) => string[];
    add: (opts: string | GitTagAddOption) => GitTagType;
    show: (name: string) => string;
    push: (name: string) => void;
};
export interface GitClientType {
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
export declare const gitClient: GitClientType;
export default gitClient;
//# sourceMappingURL=git.d.ts.map