const { default: traverse } = require('@babel/traverse');
const { default: generate } = require('@babel/generator');
const { parse } = require('@babel/parser');
const t = require('@babel/types');
const { getArgType } = require('./_util');

module.exports = function astCtrl(codes, visitorCreater) {
  if (!getArgType(visitorCreater).isFunction) {
    return codes;
  }

  const visitor = visitorCreater(t);
  if (!getArgType(visitor).isObject) {
    return codes;
  }
  const ast = parse(codes, {
    sourceType: "module"
  });
  traverse(ast, visitor);
  const { code } = generate(ast, { }, codes);
  return code;
}
