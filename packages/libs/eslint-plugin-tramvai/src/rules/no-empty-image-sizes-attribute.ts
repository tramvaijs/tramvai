import type { Rule } from 'eslint';

export const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Always set the sizes attribute, this will allow the browser to load images more optimally. Read more about sizes property at TramvaiImage docs',
      category: 'Best Practices',
      recommended: true,
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node: any) {
        if (node.name.name === 'TramvaiImage') {
          const hasSizesAttribute = node.attributes.some(
            (attribute: any) => attribute.type === 'JSXAttribute' && attribute.name.name === 'sizes'
          );

          if (!hasSizesAttribute) {
            context.report({
              node,
              message:
                'sizes prop is not provided to TramvaiImage. Always set the sizes attribute, this will allow the browser to load images more optimally',
            });
          }
        }
      },
    };
  },
};
