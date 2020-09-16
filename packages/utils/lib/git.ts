import execa from 'execa';
import log from './log';
import { getArgType, createExecCmd } from './_util';

const AGRS_TIP = 'arguments of the command should be an array.';
const execCmd = createExecCmd('git', AGRS_TIP);

type ExecaResType = execa.ExecaSyncReturnValue | execa.ExecaSyncReturnValue<Buffer>;
interface GitConfigObjType {
  add: (key: string, value: string) => ExecaResType;
  get: (key: string) => ExecaResType;
  remove: (key: string) => ExecaResType;
  readonly list: string[];
}
enum GitConfigLevelType {
  local = 'local',
  global = 'global',
  system = 'system'
}
type GitConfigType = {
  [key in GitConfigLevelType]: GitConfigObjType;
}
type GitStatusType = {
  clean: boolean;
  files: string;
}
type GitBranchType = {
  has: (name: string) => boolean;
  add: (name: string, base: string) => void;
  switch: (name: string) => void;
  removeLocal: (name: string) => void;
  removeRemote: (name: string) => void;
}
type GitRemoteType = {
  update: (name: string) => ExecaResType;
  add: (name: string, url: string, agrs: string[]) => ExecaResType;
  rename: (old: string, newname: string) => ExecaResType;
  remove: (name: string) => ExecaResType;
  setUrl: (name: string, newurl: string) => ExecaResType;
  getUrl: (name: string) => ExecaResType;
  readonly list: string[][];
}
type GitTagAddOption = {
  name: string;
  msg: string;
  commit: string;
}
type GitTagType = {
  readonly list: string[];
  filter: (pattern: string) => string[];
  add: (opts: string | GitTagAddOption) => GitTagType;
  show: (name: string) => string;
  push: (name: string) => void;
}

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

const gitClient: GitClientType = {
  get config() {
    // git.config.local.add(key, value);
    const config: GitConfigType = {
      local: configCtrl(GitConfigLevelType.local),
      global: configCtrl(GitConfigLevelType.global),
      system: configCtrl(GitConfigLevelType.system)
    };
    return config;
  },
  init(agrs: string[]) {
    return execCmd('init')(agrs);
  },
  add(agrs?: string[]): GitClientType {
    if (!agrs || !agrs.length) {
      agrs = ['.'];
    }
    execCmd('add')(agrs);
    return this;
  },
  commit(msg: string, agrs: string[] = []): GitClientType {
    const { clean } = this.hasChanges;
    if (clean) return this;
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    if (msg) {
      execCmd('commit')(['-m', msg].concat(agrs));
    } else {
      assertAgrs(true, 'please commit with some message.');
    }
    return this;
  },
  commitAll(msg: string, agrs: string[]): GitClientType {
    return this.add().commit(msg, agrs);
  },
  status(agrs: string[]): GitStatusType {
    const { stdout } = execCmd('status')(agrs);
    return {
      clean: !!!stdout,
      files: stdout
    }
  },
  get hasChanges(): GitStatusType {
    return this.status(['--porcelain']);
  },
  checkClean(tag: string) {
    const { clean, files } = this.hasChanges;
    if (!clean) {
      log.error(`git tree not clean: \n${files}`, tag);
      process.exit(0);
    }
  },
  fetch(agrs?: string[]) {
    if (!agrs) {
      agrs = [];
    }
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    this.checkClean('git fetch');
    const pullAgrs: string[] = [this.defaultRemote, this.currentBranch].concat(agrs);
    execCmd('fetch')(pullAgrs);
  },
  pull(agrs?: string[]) {
    if (!agrs) {
      agrs = [];
    }
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    this.checkClean('git pull');
    const hasRemoteBranch: boolean = this.branches.includes(`remotes/${ this.remoteAndBranch }`);
    if (hasRemoteBranch) {
      const pullAgrs: string[] = [this.defaultRemote, this.currentBranch].concat(agrs);
      try {
        execCmd('pull')(pullAgrs);
      } catch(e) {
        // conflict
        console.log(e.message);
        process.exit(0);
      }
    } else {
      log.warn(`couldn't find remote ref`, this.currentBranch);
    }
  },
  push(remote?: unknown, branch?: string, agrs?: string[]) {
    if (!branch && !agrs && getArgType(remote).isArray) {
      agrs = <string[]>remote;
    }
    if (!agrs) {
      agrs = [];
    }
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    this.checkClean('git push');
    const pushAgrs: string[] = [<string>remote || this.defaultRemote, branch || this.currentBranch];
    execCmd('push')(pushAgrs.concat(agrs));
  },
  log(agrs: string[]): string {
    const { stdout } = execCmd('log')(agrs);
    return stdout;
  },
  merge(agrs: string[]) {
    execCmd('merge')(agrs);
  },
  get branch(): GitBranchType {
    return {
      has: (name: string): boolean => {
        return this.branches.includes(name);
      },
      add: (name: string, base: string) => {
        if (!name) return;
        const agrs = ['-b', name];
        if (base) {
          agrs.push(base);
        }
        execCmd('checkout')(agrs);
      },
      switch: (name: string) => {
        execCmd('checkout')([name]);
      },
      removeLocal: (name: string) => {
        execCmd('branch')(['-D', name]);
      },
      removeRemote: (name: string) => {
        execCmd('push')([this.defaultRemote, '-d', name]);
      }
    }
  },
  get maybePull(): boolean {
    const [behind] = this.behindAndAhead;
    return Boolean(behind);
  },
  get behindAndAhead(): number[] {
    this.remote.update(this.defaultRemote);
    const { stdout } = execCmd('rev-list')(["--left-right", "--count", `${ this.remoteAndBranch }...${ this.currentBranch }`]);
    return stdout.split("\t").map(val => parseInt(val, 10));
  },
  get remote(): GitRemoteType {
    const remoteCtrl = execCmd('remote');
    const $this = this;
    return {
      update: (name: string) => remoteCtrl(['update'].concat(name || [])),
      add: (name: string, url: string, agrs: string[] = []) => remoteCtrl(['add', ...agrs, name, url]),
      rename: (old: string, newname: string) => remoteCtrl(['rename', old, newname]),
      remove: (name: string) => remoteCtrl(['remove', name]),
      setUrl: (name: string, newurl: string) => remoteCtrl(['set-url', name, newurl]),
      getUrl: (name: string) => remoteCtrl(['get-url', name]),
      get list() {
        return $this.remotes;
      }  
    }
  },
  newTag(name: string | GitTagAddOption) {
    this.tag.add(name).push((<GitTagAddOption>name).name || <string>name);
  },
  get tag(): GitTagType {
    const tagCtrl = execCmd('tag');
    const gitTag: GitTagType = {
      get list() {
        let list: string[] = [];
        const { stdout, failed } = tagCtrl();
        if (!failed) {
          list = splitOut(stdout);
        }
        return list;
      },
      filter: (pattern: string): string[] => {
        let list: string[] = [];
        const { stdout, failed } = tagCtrl(['-l', pattern]);
        if (!failed) {
          list = splitOut(stdout);
        }
        return list;
      },
      add: (opts: string | GitTagAddOption = ''): GitTagType => {
        const agrsType = getArgType(opts);
        const exists = (name: string) => this.tag.list.includes(name);
        if (agrsType.isString) {
          if (exists(<string>opts)) return gitTag;
          tagCtrl([<string>opts]);
        } else if (agrsType.isObject) {
          if (exists((<GitTagAddOption>opts).name)) return gitTag;
          const { name, msg, commit } = <GitTagAddOption>opts || {};
          let agrs: string[] = [];
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
      show(name: string): string {
        const { stdout, failed } = execCmd('show')([name]);
        if (!failed) {
          return stdout;
        }
        return '';
      },
      push: (name: string) => {
        execCmd('push')([this.defaultRemote, name]);
      }
    }
    return gitTag;
  },
  get branches(): string[] {
    const { stdout } = execCmd('branch')(['-a']);
    return splitOut(stdout).map(str => str.trim());
  },
  get mayHaveConflict(): boolean {
    const hasRemoteBranch: boolean = this.branches.includes(`remotes/${ this.remoteAndBranch }`);
    if (hasRemoteBranch) {
      const preCommit = this.currRemoteCommit;
      this.fetch();
      const newCommit = this.currRemoteCommit;
      return preCommit !== newCommit;
    } else {
      return false;
    }
  },
  get remoteAndBranch() {
    return `${ this.defaultRemote }/${ this.currentBranch }`;
  },
  get currRemoteCommit(): string {
    return splitOut(this.log([this.remoteAndBranch, '--pretty=format:%h']))[0];
  },
  get remotes(): string[][] {
    return splitOut(execCmd('remote')(['-v']).stdout)
            .filter(item => item.endsWith('(fetch)'))
            .map(item => {
              const values: string[] = item.split('\t');
              values[1] = values[1].replace(/\s+\(fetch\)$/, '');
              return values;
            });
  },
  get defaultRemote(): string {
    let defaultRemote = '';
    const remotes = this.remotes;
    if (remotes.length) {
      defaultRemote = remotes[0][0];
    }
    return defaultRemote;
  },
  get currentBranch(): string {
    const { stdout: branch } = execCmd('symbolic-ref')(['--short', 'HEAD']);
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
function configCtrl(level: GitConfigLevelType): GitConfigObjType {
  return {
    add(key: string, value: string): ExecaResType {
      return execCmd('config')([`--${ level }`, key, value]);
    },
    get(key: string): ExecaResType {
      return execCmd('config')([`--${ level }`, key]);
    },
    remove(key: string): ExecaResType {
      return execCmd('config')([`--${ level }`, '--unset', key]);
    },
    get list(): string[] {
      const { stdout, failed } = execCmd('config')([`--${ level }`, '-l']);
      if (!failed) {
        return splitOut(stdout);
      } else {
        return [];
      }
    }
  }
}

function assertAgrs(bool: boolean, msg: string) {
  if (bool) {
    log.error(msg, 'git');
    process.exit(0);
  }
}

function splitOut(stdout: string = ''): string[] {
  return stdout.toString().trim().split(/[\r\n]/);
}

export default gitClient;