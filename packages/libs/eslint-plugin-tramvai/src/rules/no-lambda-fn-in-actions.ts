import type { Rule } from 'eslint';

export const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Do not use arrow function as the value of the "fn" property inside declareAction',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      disallowedArrowFn:
        'Do not use arrow function as the value of the "fn" property inside declareAction',
    },
  },

  create(context) {
    return {
      CallExpression(node: any) {
        if (
          node.callee.name === 'declareAction' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          const { properties } = node.arguments[0];
          const fnProperty = properties.find(
            (prop: any) => prop.type === 'Property' && prop.key.name === 'fn' && !prop.computed
          );

          if (
            fnProperty &&
            fnProperty.value &&
            fnProperty.value.type === 'ArrowFunctionExpression'
          ) {
            const fnCode = context.getSourceCode().getText(fnProperty.value.body);
            // Заменить стрелочную функцию на объявление функции с аргументами и телом
            context.report({
              node: fnProperty.value,
              messageId: 'disallowedArrowFn',
              fix: (fixer) => [
                fnCode[0] === '{'
                  ? fixer.replaceText(fnProperty, `fn () { ${fnCode.slice(1, fnCode.length - 1)} }`)
                  : fixer.replaceText(fnProperty, `fn () { return ${fnCode} }`),
              ],
            });
          }
        }
      },
    };
  },
};
