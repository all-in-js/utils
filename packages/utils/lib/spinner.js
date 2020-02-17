const ora = require('ora');

// 不能和同步的child_process方法一起使用
// 使用promise的execa和await

const spinner = {
  _spinner: null,
  step(txt) {
    if(this._spinner) {
      this._spinner.text = txt;
    } else {
      this._spinner = ora().start(txt);
    }
  },
  clear() {
    if(this._spinner) {
      this._spinner.clear();
      return this._spinner;
    }
  },
  stop() {
    if(this._spinner) {
      this._spinner.clear().stop();
    }
    this._spinner = null;
  },
  succeed(txt) {
    if(this._spinner) {
      this._spinner.clear().succeed(txt);
    }
    this._spinner = null;
  },
  fail(txt) {
    if(this._spinner) {
      this._spinner.clear().fail(txt);
    }
    this._spinner = null;
  }
}

module.exports = spinner;