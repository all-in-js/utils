import ora, { Options, Ora } from 'ora';

// 不能和同步的child_process方法一起使用
// 使用promise的execa和await
export default class Spinner {
  public _spinner: Ora;
  constructor(options: Options | string) {
    this._spinner = ora(options).start();
  }
  step(txt: string) {
    this._spinner.text = txt;
  }
  clear() {
    this._spinner.clear();
    return this._spinner;
  }
  stop() {
    this._spinner.clear().stop();
  }
  succeed(txt: string) {
    this._spinner.clear().succeed(txt);
  }
  fail(txt: string) {
    this._spinner.clear().fail(txt);
  }
}
