# utils

> 常用的脚本操作函数集合，避免易出bug的点，统一交互风格

## Install

```
npm i @iuv-tools/utils
```

## Example

> 该包提供了一批易出bug的函数、易于调用的函数，如resolve, resolveCWD, resolveDirname, resolveHome等

* git操作
```js
// 有文件更改则提交更改

const { git } = require('@iuv-tools/utils');

const { clean } = git.hasChanges;

if (!clean) {
  git.commitAll('update sth.');
}
```

* vue-cli风格的logger
```js
const { log } = require('@iuv-tools/utils');

log.info('msg', 'tag');
```

* 命令行spinner
```js
const { spinner } = require('@iuv-tools/utils');

spinner.step('start...');
// do sth
spinner.success('success');
```

* npm操作
```js
const { npm } = require('@iuv-tools/utils');

const pkgTags = npm.tag.list('@iuv-tools/utils');
```

* 钉钉群消息提醒
```js
const { DDWebhook } = require('@iuv-tools/utils');

const secret = 'srcret';
const webhook = 'webhook';
new DDWebhook({
  secret,
  webhook
}).sendMessage('msg')
.then(console.log)
.catch(console.log);
```

* ast抽象语法树操作
```js
const { astCtrl } = require('@iuv-tools/utils');

function visitorCreater(t) {
  // 
}

const code = astCtrl('code', visitorCreater);
```

## Plan
持续完善中，欢迎加入！