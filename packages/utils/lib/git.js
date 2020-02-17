const log = require('./log');
const { getArgType, createExecCmd } = require('./_util');

const AGRS_TIP = 'arguments of the command should be an array.';
const execCmd = createExecCmd('git', AGRS_TIP);

const gitClient = {
  get config() {
    // git.config.local.add(key, value);
    const config = {};
    const configCtrl = level => {
      return {
        add(key, value) {
          return execCmd('config')([`--${ level }`, key, value]);
        },
        get(key) {
          return execCmd('config')([`--${ level }`, key]);
        },
        remove(key) {
          return execCmd('config')([`--${ level }`, '--unset', key]);
        },
        get list() {
          const { stdout, failed } = execCmd('config')([`--${ level }`, '-l']);
          if (!failed) {
            return splitOut(stdout);
          } else {
            return [];
          }
        }
      }
    }
    ;['local', 'global', 'system'].forEach(level => config[level] = configCtrl(level));
    return config;
  },
  init() {
    return execCmd('init').apply(this, arguments);
  },
  add(agrs = ['.']) {
    execCmd('add')(agrs);
    return this;
  },
  commit(msg, agrs = []) {
    const { clean } = this.hasChanges;
    if (clean) return;
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    if (msg) {
      execCmd('commit')(['-m', msg].concat(agrs));
      return this;
    } else {
      assertAgrs(true, 'please commit with some message.');
    }
  },
  commitAll(msg, agrs) {
    return this.add().commit(msg, agrs);
  },
  status() {
    const { stdout } = execCmd('status').apply(this, arguments);
    return {
      clean: !!!stdout,
      files: stdout
    }
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
  fetch(agrs = []) {
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    this.checkClean('git fetch');
    const pullAgrs = [this.defaultRemote, this.currentBranch].concat(agrs);
    execCmd('fetch')(pullAgrs);
  },
  pull(agrs = []) {
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    this.checkClean('git pull');
    const hasRemoteBranch = this.branches.includes(`remotes/${ this.remoteAndBranch }`);
    if (hasRemoteBranch) {
      const pullAgrs = [this.defaultRemote, this.currentBranch].concat(agrs);
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
  push(remote, branch, agrs) {
    if (!branch && !agrs && getArgType(remote).isArray) {
      agrs = remote;
    }
    if (!agrs) {
      agrs = [];
    }
    assertAgrs(!getArgType(agrs).isArray, AGRS_TIP);
    this.checkClean('git push');
    const pushAgrs = [remote || this.defaultRemote, branch || this.currentBranch];
    execCmd('push')(pushAgrs.concat(agrs));
  },
  log() {
    const { stdout } = execCmd('log').apply(this, arguments);
    return stdout;
  },
  merge() {
    execCmd('merge').apply(this, arguments);
  },
  get branch() {
    return {
      has: name => {
        return this.branches.includes(name);
      },
      add: (name, base) => {
        if (!name) return;
        const agrs = ['-b', name];
        if (base) {
          agrs.push(base);
        }
        execCmd('checkout')(agrs);
      },
      switch: name => {
        execCmd('checkout')([name]);
      },
      removeLocal: name => {
        execCmd('branch')(['-D', name]);
      },
      removeRemote: name => {
        execCmd('push')([this.defaultRemote, '-d', name]);
      }
    }
  },
  get maybePull() {
    const [behind] = this.behindAndAhead;
    return Boolean(behind);
  },
  get behindAndAhead() {
    this.remote.update(this.defaultRemote);
    const { stdout } = execCmd('rev-list')(["--left-right", "--count", `${ this.remoteAndBranch }...${ this.currentBranch }`]);
    return stdout.split("\t").map(val => parseInt(val, 10));
  },
  get remote() {
    const remoteCtrl = execCmd('remote');
    const $this = this;
    return {
      update: name => remoteCtrl(['update'].concat(name || [])),
      add: (name, url, agrs = []) => remoteCtrl(['add', ...agrs, name, url]),
      rename: (old, newname) => remoteCtrl(['rename', old, newname]),
      remove: name => remoteCtrl(['remove', name]),
      setUrl: (name, newurl) => remoteCtrl(['set-url', name, newurl]),
      getUrl: name => remoteCtrl(['get-url', name]),
      get list() {
        return $this.remotes;
      }  
    }
  },
  newTag(name) {
    this.tag.add(name).tag.push(name.name || name);
  },
  get tag() {
    const tagCtrl = execCmd('tag');
    
    return {
      get list() {
        let  list = [];
        const { stdout, failed } = tagCtrl();
        if (!failed) {
          list = splitOut(stdout);
        }
        return list;
      },
      filter: pattern => {
        let  list = [];
        const { stdout, failed } = tagCtrl(['-l', pattern]);
        if (!failed) {
          list = splitOut(stdout);
        }
        return list;
      },
      add: (opts = '') => {
        const agrsType = getArgType(opts);
        const exists = name => this.tag.list.includes(name);
        if (agrsType.isString) {
          if (exists(opts)) return this;
          tagCtrl([opts]);
        } else if (agrsType.isObject) {
          if (exists(opts.name)) return this;
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
        return this;
      },
      show(name) {
        const { stdout, failed } = execCmd('show')([name]);
        if (!failed) {
          return stdout;
        }
      },
      push: name => {
        execCmd('push')([this.defaultRemote, name]);
      }
    }
  },
  get branches() {
    const { stdout } = execCmd('branch')(['-a']);
    return splitOut(stdout).map(str => str.trim());
  },
  get mayHaveConflict() {
    const hasRemoteBranch = this.branches.includes(`remotes/${ this.remoteAndBranch }`);
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
  get currRemoteCommit() {
    return splitOut(this.log([this.remoteAndBranch, '--pretty=format:%h']))[0];
  },
  get remotes() {
    return splitOut(execCmd('remote')(['-v']).stdout)
            .filter(item => item.endsWith('(fetch)'))
            .map(item => {
              item = item.split('\t');
              item[1] = item[1].replace(/\s+\(fetch\)$/, '');
              return item;
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
    const { stdout: branch } = execCmd('symbolic-ref')(['--short', 'HEAD']);
    return branch;
  }
};

module.exports = gitClient;
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

function assertAgrs(bool, msg) {
  if (bool) {
    log.error(msg, 'git');
    process.exit(0);
  }
}

function splitOut(stdout = '') {
  return stdout.toString().trim().split(/[\r\n]/);
}
