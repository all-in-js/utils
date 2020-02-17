const { createExecCmd } = require('./_util');

const AGRS_TIP = 'arguments of the command should be an array.';
const execCmd = createExecCmd('npm', AGRS_TIP);

const npmClient = {
  get version() {
    const { stdout } = execCmd()(['-v']);
    return stdout;
  },
  get config() {
    let conf = {};
    try {
      const { stdout } = execCmd('config')(['list', '--json']);
      conf = JSON.parse(stdout);
    } catch(e) {
      console.log(e);
    }
    const registry = conf.registry || '';
    const uInfo = key => {
      return conf[`${ registry.replace(/^https?:/, '') + (registry.endsWith('/') ? '' : '/')}:${ key }`];
    }
    return {
      registry,
      username: uInfo('username'),
      email: uInfo('email')
    }
  },
  setConfig(key, value) {
    execCmd('config')(['set', `${ key }`, `${ value }`]);
    return this.config;
  },
  addDistTag() {
    return this.tag.add.apply(this, arguments);
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
        const { stdout } = execCmd('dist-tag')(['add', `${ pkg }@${ version }`, tag]);
        return stdout;
      },
      remove(pkg, tag = 'latest') {
        const { stdout } = execCmd('dist-tag')(['rm', pkg, tag]);
        return stdout;
      }
    }
  }
}

module.exports = npmClient;
