import traverse, { NodePath, Visitor } from '@babel/traverse';
import generate from '@babel/generator';
import { parse } from '@babel/parser';
import types from '@babel/types';
import fse from 'fs-extra';
import log from './log';
import { getArgType } from './_util';

interface CbBabelType  {
  types: typeof types;
  traverse: typeof traverse;
  generate: typeof generate;
  parse: typeof parse;
}

interface ExtraType {
  [key: string]: any
}

export type VisitorCreaterType<T extends ExtraType> = (_babel: CbBabelType, extra: T) => Visitor;

/**
 * AST操作, 节点操作时需要收集数据的话，可以将数据挂到extra对象上
 * @param {string} filepath 文件路径
 * @param {function} visitorCreater visitor生成函数
 * visitorCreater：({
 *   types,
 *   traverse,
 *   generate,
 *   parse
 * }, extra) => { code, extra }
 * @returns {object} 返回新生成的code和extra信息
 */
export function astCtrl<T extends ExtraType>(filepath: string, visitorCreater: VisitorCreaterType<T>) {
  if (!fse.existsSync(filepath)) {
    log.error(`can not resolve the filepath: ${filepath}`, 'astCtrl');
    process.exit();
  }

  const extra: ExtraType = {};
  const codes: string = fse.readFileSync(filepath).toString();

  if (!getArgType(visitorCreater).isFunction) {
    log.error(`'visitorCreater' should be a function`, 'astCtrl');
    process.exit();
  }

  const _babel: CbBabelType = {
    types,
    traverse,
    generate,
    parse
  };
  const visitor = visitorCreater(_babel, <T>extra);

  if (!getArgType(visitor).isObject) {
    log.error(`expect 'visitorCreater' return an Object`, 'astCtrl');
    process.exit();
  }

  const ast = parse(codes, {
    sourceType: "module"
  });

  traverse(ast, visitor);

  const generatorOpts = {
    jsescOption: {
      minimal: true
    },
  }
  const { code } = generate(ast, generatorOpts, codes);

  return {
    code,
    extra: extra as T
  };
}

// example:
// type iExtra = {
//   abc: string;
// }
// const visitorCreater: VisitorCreaterType<iExtra> = function(babel, extra) {
//   console.log(babel);
//   return {
//     VariableDeclarator(p: NodePath) {
//       extra.abc = p.type;
//     }
//   }
// }

// const { code, extra } = astCtrl(require('path').resolve(__dirname, 'git.js'), visitorCreater);
// console.log(code, extra); // -> var a = 1; { abc: 'VariableDeclarator' }

export default astCtrl;