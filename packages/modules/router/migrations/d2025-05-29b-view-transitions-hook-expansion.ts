import type { Api } from '@tramvai/tools-migrate';
import type { Identifier } from 'jscodeshift';

export default async (api: Api) => {
  await api.transform(({ source }, { j }, { printOptions }) => {
    const parsed = j(source);

    const variableDeclarators = parsed.find(j.VariableDeclarator).filter((path) => {
      const { node } = path;
      if (node.id.type !== 'Identifier') {
        return false;
      }
      if (!node.init || node.init.type !== 'CallExpression') {
        return false;
      }
      const { callee } = node.init;
      return callee.type === 'Identifier' && callee.name === 'useViewTransition';
    });

    variableDeclarators.forEach((path) => {
      const { node } = path;
      const variableName = (node.id as Identifier).name;
      const targetVarName = 'isTransitioning';
      const objectProperty = j.property(
        'init',
        j.identifier(targetVarName),
        j.identifier(variableName)
      );
      const newDeclarator = j.variableDeclarator(j.objectPattern([objectProperty]), node.init);
      j(path).replaceWith(newDeclarator);
    });
    if (variableDeclarators.length) {
      return parsed.toSource(printOptions);
    }
  });
};
