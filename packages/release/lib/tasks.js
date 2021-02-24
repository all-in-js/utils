const { c, spinner, log, resolvePkg, getArgType, hasYarn } = require('@all-in-js/utils');
const execa = require('execa');

const { name, scripts = {} } = resolvePkg();
const npmClient = hasYarn() ? 'yarn' : 'npm';

function beforeAllRun() {
  log.info(`ready to release ${name}`, 'release');
}

function afterAllRun() {
  const { version } = resolvePkg();
  const pkgInfo = `${(name || '') + (version ? `@${version}` : '')}`
  log.done(`${pkgInfo} released.`, 'release');
  process.exit();
}

function succMsg(script, per) {
  return `${ per } exec ${ c.cyan(script) } succeed.`;
}

function failMsg(script, per) {
  return `${ per } exec ${ c.cyan(script) } failed.`;
}

function startInfo(script, per) {
  return `${ per } running script: ${ c.cyan(script) }`;
}

function noop() {}

class TasksRunner {
  constructor({
    tasks = [],
    beforeAll = beforeAllRun,
    afterAll = afterAllRun
  } = {}) {
    this.beforeAll = beforeAll;
    this.afterAll = afterAll;
    this.runAll(tasks);
  }
  async runScript(script, per) {
    // log.info(`run script: ${ script }`, npmClient);
    // console.log(`       > ${ scripts[script] }`);
    spinner.step(startInfo(script, per));
    let agrs = [script];
    if (scripts[script] && npmClient === 'npm') {
      agrs.unshift('run');
    }
    try {
      await execa(npmClient, agrs);
      spinner.succeed(succMsg(script, per));
    } catch(e) {
      spinner.fail(failMsg(script, per));
      log.error(e, npmClient);
      process.exit(0);
    }
  }
  async runExec(name, exec, per) {
    spinner.step(startInfo(name, per));
    try {
      await exec();
      spinner.succeed(succMsg(name, per));
    } catch(e) {
      spinner.fail(failMsg(name, per));
      log.error(e, npmClient);
      process.exit(0);
    }
  }
  async runAll(tasks) {
    await this.beforeAll();
    if (Array.isArray(tasks) && tasks.length) {
      let start = 0;
      while(start <= tasks.length - 1) {
        const task = tasks[start];
        const taskType = getArgType(task);
        const per = `[${ start + 1 }/${ tasks.length }]`;
        if (taskType.isString) {
          await this.runScript(task, per);
        } else {
          const { name, exec } = task;
          const type = getArgType(exec);
          if (type.isFunction) {
            await this.runExec(name, exec, per);
          } else if (type.isString) {
            await this.runScript(exec, per);
          }
        }
        start += 1;
      }
      this.afterAll();
    }
  }
}

// new TasksRunner({
//   tasks: [
//     {
//       name: 'getok',
//       exec: () => new Promise((rs, rj) => {
//         setTimeout(() => {
//           rs('ok');
//         }, 3000);
//       })
//     },
//     {
//       exec: 'testa'
//     }
//   ]
// });

module.exports = TasksRunner;