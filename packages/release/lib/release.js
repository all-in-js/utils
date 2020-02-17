const c = require('chalk');
const bump = require('version-bump-prompt');
const execa = require('execa');
const { log, resolvePkg, git, npm, fetch } = require('@eryue/utils');
const TasksRunner = require('./tasks');

const { scripts: SCRIPTS, name: pkgName } = resolvePkg();
const VERSION_TAGS = ['alpha', 'beta', 'rc', 'ga', 'release', 'stable', 'final', 'latest'];

function fetchPkgVersions() {
  return fetch(npm.config.registry + pkgName)
        .then(res => res.json())
        .then(res => {
          return Promise.resolve(res.error ? null : Object.values(res.versions).map(v => v.version));
        });
}

class Release {
  constructor({
    dd,
    gittag = true,
    branch,
    scripts,
    afterAllScripts
  } = {}) {
    this.dd = dd;
    this.gittag = gittag;
    this.branch = branch;
    this.versionInfo = {};
    this.scripts = scripts ? scripts.split(',') : [];
    this.afterAllScripts = afterAllScripts ? afterAllScripts.split(',') : [];
    if (branch) {
      this.checkBranch();
    }
    this.checkGitTreeClean();
    bump().then(versionInfo => {
      this.versionInfo = versionInfo;
      this.latest = versionInfo.newVersion;
      let tasks = this.scripts.concat([
        this.publishTask(),
        this.afterAllTask()
      ]);

      if (this.afterAllScripts.length) {
        tasks = tasks.concat(this.afterAllScripts);
      }
      // 收尾脚本
      new TasksRunner({
        tasks,
        afterAll: () => {
          const version = this.versionInfo.newVersion;
          const pkgInfo = `${(pkgName || '') + (version ? `@${version}` : '')}`;
          log.done(`${pkgInfo} released.`, 'release');
          process.exit();
        }
      });
    });
  }
  async afterAll() {
    const { newVersion } = this.versionInfo;
    // git tag: v info
    if (this.gittag) {
      this.addGittag(newVersion);
    }
    await this.addLatest();
  }
  addGittag(newVersion) {
    const { clean } = git.status(['--porcelain']);
    const msg = `released new version: v${ newVersion }`;
    const name = `v${ newVersion }`;
    const commit = git.log(['--pretty=format:%H']).split(/[\r\n]/)[0];
    if (clean) {
      git.newTag({
        name,
        msg,
        commit
      });
    } else {
      git.commitAll(msg, ['--no-verify']);
      git.newTag(name);
    }
  }
  async addLatest() {
    await this.getLatestVersion();
    if (this.latest) {
      await npm.addDistTag(pkgName, this.latest, 'latest');
    }
  }
  async getLatestVersion() {
    const vs = await fetchPkgVersions();
    if (vs && vs.length) {
      for (const v of vs) {
        if (!this.withTag(v)) {
          this.latest = v;
          break;
        }
      }
    }
  }
  afterAllTask() {
    return {
      name: 'add tag',
      exec: this.afterAll.bind(this)
    }
  }
  publishTask() {
    let exec = 'publish'
    if (!SCRIPTS.publish) {
      exec = async () => {
        await this.publish();
      }
    }
    return {
      name: 'publish',
      exec
    }
  }
  async publish() {
    const tag = this.withTag(this.versionInfo.newVersion);
    const agrs = ['publish'];
    if (tag) {
      agrs.push(`--tag`);
      agrs.push(tag);
    }          
    await execa('npm', agrs);
  }
  withTag(version) {
    const tag = (version.match(/([a-zA-Z]+)/) || [])[0] || '';
    return VERSION_TAGS.includes(tag.toLowerCase()) ? tag : 0;
  }
  checkBranch() {
    const branch = git.currentBranch;
    if (branch !== this.branch) {
      log.error(`please checkout to ${ this.branch } branch!`, 'git');
      process.exit(0);
    }
  }
  checkGitTreeClean() {
    const { clean, files } = git.status(['--porcelain']);
    const infos = !clean ? files.split('\n') : [];
    if (infos.length) {
      infos.unshift('Git working directory not clean.');
      infos.forEach(info => console.log('npm', c.red('ERR!'), info.trim()));
      process.exit(0);
    }
  }
}

module.exports = Release;
// 1. 确认git tree clean
// 2. 选版本version 
// 3. lint
// 4. test
// 5. build
// 6. changelog -p(是否push)
// 7. publish