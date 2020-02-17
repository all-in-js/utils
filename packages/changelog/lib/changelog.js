const { cwd: currDir, log, git, resolvePkg, resolve } = require('@iuv-tools/utils');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const writePackage = require('write-pkg');
const pkg = resolvePkg();
const { url: repoLink, releaseId } = pkg.repository || {};
const defaultCommitFields = ['feat', 'fix', 'docs', 'test'];
const nameMapping = {
  feat: '新特性',
  fix: 'Bug fixes',
  docs: '文档更新',
  style: '代码美化',
  refactor: '重构优化',
  perf: '性能优化',
  test: '单元测试',
  workflow: '工作流',
  ci: '持续集成',
  chore: '构建流程',
  types: '类型',
  build: '打包发布'
}

function exit() {
  process.exit(0);
}

const gitlogs = (() => {
  let logs;
  return {
    get logs() {
      if (!logs) {
        const splitId = Math.random().toString(16).slice(2, 12);
        const gitlogs = git.log(['--pretty=format:%s '+ splitId +' %h']);
        logs = gitlogs.toString().split(/[\r\n]/).map((item) => {
          let log = [];
          try {
            log = item.split(` ${splitId} `);
            const [msg] = log;
            log.push(matchScope(msg));
            // [msg, id, scope] = log
          } catch (e) {}
          return log;
        });
      }
      return logs;
    }
  }
})();

function getType(msg) {
  const match = msg.match(/^(\w+)(\(.+?\))?:/);
  return match ? match[1] : '';
}

function matchScope(msg) {
  let scope;
  const match = msg.match(/^\w+\((.+?)\)/);
  if (match) {
    scope = match[1];
  }
  return scope;
}

function findLastIndex(logs, releaseId) {
  let lastIndex = 0;
  for (let i = 0; i <= logs.length - 1; i++) {
    const [msg, id] = logs[i];
    if (id === releaseId) {
      lastIndex = i;
      break;
    }
  }
  
  return lastIndex;
}

function mergeScope(logs) {
  const scopedLogs = {};
  // {
  //   [scope]: {
  //     feat: [],
  //     fix: []
  //   }
  // }
  for (const [msg, id, scope] of logs) {
    if (scope) {
      const scoped = scopedLogs[scope];
      const type = getType(msg);
      if (scoped) {
        if (scoped[type]) {
          scoped[type].push([msg, id]);
        } else {
          scoped[type] = [[msg, id]];
        }
      } else {
        scopedLogs[scope] = {};
        scopedLogs[scope][type] = [[msg, id]];
      }
    }
  }
  return scopedLogs;
}

function sliceMsg(msg) {
  return msg.replace(/^\w+(\(.+?\))?:\s/, '');
}

function fmtItems(template) {
  return Object.keys(template).map(prefix => {
    const items = template[prefix];
    return `${items.length ? `#### ${nameMapping[prefix]}

${items.join('\n')}` : ''}`
  }).join('\n');
}

function writeReleaseId() {
  let logs = gitlogs.logs;
  pkg.repository.releaseId = logs[0][1];
  writePackage.sync(pkg);
}

function fmtRepositoryUrl(url) {
  if (url.startsWith('git@')) {
    url = url.replace(/^git@/, '');
  }
  if (url.endsWith('.git')) {
    url = url.replace(/\.git$/, '');
  }
  return url;
}

function checkRepositoryUrl(url = '') {
  if (repoLink) {
    url = repoLink;
  } else {
    if (url) {
      pkg.repository = {
        url,
        type: 'git'
      }
    }
  };
  return fmtRepositoryUrl(url);
}

function runCommit(commit) {
  let verify = [];
  if (typeof commit !== 'string') {
    commit = 'Update CHANGELOG.md';
    verify = ['--no-verify'];
  }
  const cmd = `git add . && git commit -m "${commit}"${verify[0] || ''}`;
  log.info(cmd, 'git');
  git.commitAll(commit, verify);
}

function runPush(commit) {
  const currBranch = git.currentBranch;
  const remote = git.defaultRemote;
  if (!git.maybePull) {
    runCommit(commit);
    const cmd = `git push ${remote} ${currBranch}`;
    log.info(cmd, 'git');
    git.push();
    log.info('push success!', 'git');
  } else {
    log.warn('Remote history differ. Please pull changes.', 'git');
    exit();
  }
}

function saveVersion(newVersion) {
  if (newVersion && pkg.version !== newVersion) {
    pkg.version = newVersion;
  }
}
// commitFields, commit, push, version
// template cjs[header, body, footer]
// 复杂的commit

class Changelog {
  constructor({
    commitFields,
    commit,
    push,
    version,
    repository
  } = {}) {
    this.commitFields = defaultCommitFields;
    if (typeof commitFields === 'string') {
      this.commitFields = commitFields.split(',');
    }
    this.commit = commit;
    this.push = push;
    this.version = version || pkg.version;
    this.repository = checkRepositoryUrl(repository);
    saveVersion(version);
    if (!this.repository) {
      log.error('please provide the repository URL', 'git');
      exit();
    };
  }
  initTemplate() {
    const template = {};
    this.commitFields.forEach(prefix => template[prefix] = []);
    return template;
  }
  filterLogs(logs) {
    return logs.filter(([msg]) => new RegExp('^(' + this.commitFields.join('|')+')(\\(.+?\\))?:', 'i').test(msg));
  }
  commitLink(msg, id) {
    msg = this.matchIssues(msg);
    return `${msg} [${id}](${this.repository}/commit/${id})`; 
  }
  matchIssues(msg) {
    return msg.replace(/#(\d+)/g, (mat, issueId) => {
      return `[#${issueId}](${this.repository}/issues/${issueId})`;
    });
  }
  fmtMsg(msg, id) {
    return this.commitLink(sliceMsg(msg), id);
  }
  fmtLogs() {
    let logs = gitlogs.logs;
    if (!logs.length) {
      return [];
    }
    const lastIndex = 0;
    const [msg, id] = logs[lastIndex];
    if (releaseId) {
      if (releaseId !== id) {
        const releaseIns = findLastIndex(logs, releaseId);
        if (releaseIns !== lastIndex) {
          logs = logs.slice(0, releaseIns);
          return this.filterLogs(logs);
        }
      }
      return [];
    } else {
      return this.filterLogs(logs);
    }
  }
  changelogTemplate(logs = []) {
    const template = this.initTemplate();
    const scopedLogs = mergeScope(logs);
    for (const [msg, id, scope] of logs) {
      const scoped = scopedLogs[scope];
      const type = getType(msg);
      if (scope && scoped) {
        const msgs = scoped[type].map(([msg, id]) => `  - ${this.fmtMsg(msg, id)}`).join('\n');
        if (type && scoped[type].length) {
          template[type].push(`- ${scope}
${msgs}`);
          scoped[type] = [];
        }
      } else {
        template[type].push(`- ${this.fmtMsg(msg, id)}`);
      }
    }
    return this.fmtTemplate(template);
  }
  fmtTemplate(template) {
    return `
### ${this.version}

*${new Date().toLocaleString()}*

${fmtItems(template)}

-----

`;
  }
  generate() {
    const logs = this.fmtLogs();
    if (logs && logs.length) {
      let template = this.changelogTemplate(logs);
      const filepath = resolve(currDir, 'CHANGELOG.md');
      const exists = existsSync(filepath);
      if (exists) {
        const oldLogs = readFileSync(filepath, 'utf-8');
        template += oldLogs;
      }
      writeFileSync(filepath, template);
      writeReleaseId();
      log.info(`${pkg.name}@${this.version} CHANGELOG.md has created.`, 'git');
      
      if (this.push) {
        runPush(this.commit);
      } else if (this.commit) {
        runCommit(this.commit);
      }
      exit();
    } else {
      log.info(`no new commits after ${releaseId}@${this.version}`, 'git');
    }
  }
}

module.exports = Changelog;
