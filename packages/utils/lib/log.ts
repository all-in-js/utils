import c, { BackgroundColor, Color } from 'chalk';

enum Types {
  info = 'info',
  warn = 'warn',
  error = 'error',
  done = 'done'
}

type LogFnType = (msg: any, tag?: string) => void;
interface LogType {
  [Types.info]: LogFnType;
  [Types.warn]: LogFnType;
  [Types.error]: LogFnType;
  [Types.done]: LogFnType;
}

const logTypeMap = {
  [Types.info]: ['bgCyan', ''],
  [Types.warn]: ['bgYellow', 'yellow'],
  [Types.error]: ['bgRed', 'red'],
  [Types.done]: ['bgGreen', '']
};

const cTag = (tag?: string) => tag ? c.magenta(`${tag}`) : '';
const cType = (bg: string, type: string) => c[<typeof BackgroundColor>bg].black(` ${type.toUpperCase()} `);

const createLogFn = (logType: Types) => {
  return function(msg: any, tag?: string) {
    const [bg, color] = logTypeMap[logType];
    const agrs = [
      cType(bg, logType)
    ];
    const hasTag = cTag(tag);
    if (hasTag) {
      agrs.push(hasTag);
    }
    agrs.push(color ? c[<typeof Color>color](msg) : msg);  
    console.log(...agrs);
  }
}

const log: LogType = {
  [Types.info]: createLogFn(Types.info),
  [Types.warn]: createLogFn(Types.warn),
  [Types.error]: createLogFn(Types.error),
  [Types.done]: createLogFn(Types.done),
};

export default log;
// type tag? msg
// log.info('info...', 'lint');
// log.warn('warn...', 'lint');
// log.error('error...', 'lint');
// log.done('success...', 'init');
// log.success('s');