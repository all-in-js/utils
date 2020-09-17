/// <reference types="babel__traverse" />
import traverse, { Visitor } from '@babel/traverse';
import generate from '@babel/generator';
import { parse } from '@babel/parser';
import types from '@babel/types';
interface CbBabelType {
    types: typeof types;
    traverse: typeof traverse;
    generate: typeof generate;
    parse: typeof parse;
}
interface ExtraType {
    [key: string]: any;
}
export declare type VisitorCreaterType<T extends ExtraType> = (_babel: CbBabelType, extra: T) => Visitor;
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
export declare function astCtrl<T extends ExtraType>(filepath: string, visitorCreater: VisitorCreaterType<T>): {
    code: string;
    extra: T;
};
export default astCtrl;
//# sourceMappingURL=ast.d.ts.map