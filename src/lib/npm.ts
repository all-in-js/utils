import { createExecCmd } from './_util';

const AGRS_TIP = 'arguments of the command should be an array.';
const execCmd = createExecCmd('npm', AGRS_TIP);

export type NpmConfig = {
  registry: string;
  username: string;
  email: string;
}
export type NpmTagType = {
  list: (pkg: string) => string;
  add: (pkg: string, version: string, tag: string) => string;
  remove: (pkg: string, tag: string) => string;
}

export interface NmpClientType {
  readonly version: string;
  readonly config: NpmConfig;
  readonly tag: NpmTagType;
  setConfig: (key: string, value: string) => NpmConfig;
  addDistTag: NpmTagType['add'];
}

export const npmClient: NmpClientType = {
  get version(): string {
    const { stdout } = execCmd()(['-v']);
    return stdout;
  },
  get config(): NpmConfig {
    let conf = {
      registry: '',
      username: '',
      email: ''
    };
    try {
      const { stdout } = execCmd('config')(['list', '--json']);
      conf = JSON.parse(stdout);
    } catch(e) {
      console.log(e);
    }
    const registry = conf.registry;
    const uInfo = (key: string) => {
      return conf[<keyof NpmConfig>(`${ registry.replace(/^https?:/, '') + (registry.endsWith('/') ? '' : '/')}:${ key }`)];
    }
    conf.username = uInfo('username');
    conf.email = uInfo('email');
    return conf;
  },
  setConfig(key: string, value: string): NpmConfig {
    execCmd('config')(['set', `${ key }`, `${ value }`]);
    return this.config;
  },
  addDistTag(pkg: string, version: string, tag: string = 'latest'): string {
    return this.tag.add(pkg, version, tag);
  },
  get tag(): NpmTagType {
    return {
      list(pkg: string): string {
        const agrs = ['list'];
        if (pkg) {
          agrs.push(pkg);
        }
        const { stdout } = execCmd('dist-tag')(agrs);
        return stdout;
      },
      add(pkg: string, version: string, tag: string = 'latest'): string {
        const { stdout } = execCmd('dist-tag')(['add', `${ pkg }@${ version }`, tag]);
        return stdout;
      },
      remove(pkg: string, tag: string = 'latest'): string {
        const { stdout } = execCmd('dist-tag')(['rm', pkg, tag]);
        return stdout;
      }
    }
  }
}

export default npmClient;
