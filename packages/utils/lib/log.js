const c = require('chalk');

const logTypeMap = [
  ['info', 'bgCyan', ''],
  ['warn', 'bgYellow', 'yellow'],
  ['error', 'bgRed', 'red'],
  ['done', 'bgGreen', '']
];

const cTag = tag => tag ? c.magenta(`${tag}`) : '';
const cType = (bg, type) => c[bg].black(` ${type.toUpperCase()} `);

for (const [type, bg, color] of logTypeMap) {
  log[type] = function(msg, tag) {
    const agrs = [
      cType(bg, type)
    ];
    const hasTag = cTag(tag);
    if (hasTag) {
      agrs.push(hasTag);
    }
    agrs.push(color ? c[color](msg) : msg);  
    log.apply(log, agrs);
  }
}

function log(...msg) {
  console.log.apply(console, msg);
}

module.exports = log;
// type tag? msg
// log.info('info...', 'lint');
// log.warn('warn...', 'lint');
// log.error('error...', 'lint');
// log.done('success...', 'init');