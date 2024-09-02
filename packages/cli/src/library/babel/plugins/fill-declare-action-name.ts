import type { Plugin } from './types.h';

function hashCode(s: string) {
  let h = 0;
  let i = 0;
  // eslint-disable-next-line no-bitwise
  if (s.length > 0) while (i < s.length) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h.toString(36);
}

export const fillDeclareActionName: Plugin<{ declareActionName: string | null }> = (babel) => {
  const { types: t } = babel;

  return {
    pre() {
      this.declareActionName = null;
    },
    visitor: {
      Program: {
        enter(enterPath) {
          enterPath.traverse({
            ImportDeclaration: (path) => {
              if (this.declareActionName) return; // нет смысла идти дальше
              if (path.node.source.value !== '@tramvai/core') return;

              const specifier = path.node.specifiers.find(
                (s) =>
                  t.isImportSpecifier(s) &&
                  'name' in s.imported &&
                  s.imported.name === 'declareAction'
              );

              if (specifier) {
                this.declareActionName = specifier.local.name;
              }
            },
            // тут смотрим на const {declareAction} = require('@tramvai/core')
            VariableDeclarator: (path) => {
              if (this.declareActionName) return; // нет смысла идти дальше

              if (
                !t.isCallExpression(path.node.init) ||
                !t.isIdentifier(path.node.init.callee) ||
                path.node.init.callee.name !== 'require'
              ) {
                return;
              }

              const [argument] = path.node.init.arguments;

              if (!argument || ('value' in argument && argument.value !== '@tramvai/core')) return;
              if (!t.isObjectPattern(path.node.id)) return;

              const declareActionNameProperty = path.node.id.properties.find(
                (p) => 'key' in p && 'name' in p.key && p.key.name === 'declareAction'
              );

              if (
                declareActionNameProperty &&
                'value' in declareActionNameProperty &&
                'name' in declareActionNameProperty.value
              ) {
                this.declareActionName = declareActionNameProperty.value.name;
              }
            },
          });
        },
      },
      CallExpression(path) {
        if (!this.declareActionName) return;
        if ('name' in path.node.callee && path.node.callee.name !== this.declareActionName) return;

        const args = path.node.arguments;

        if (args.length !== 1) return;
        if (!t.isObjectExpression(args[0])) return;

        const nameProperty = args[0].properties.find(
          (p) => 'key' in p && 'name' in p.key && p.key.name === 'name'
        );

        if (nameProperty) return;

        let additionalDebugName: string;

        // @ts-expect-error easier to write this rather than adding if statements and type assertions
        const potentialVariableName = path.parentPath.node.id?.name as string | undefined;

        if (!potentialVariableName) {
          additionalDebugName = this.file.opts.generatorOpts.sourceFileName ?? '';
        } else {
          additionalDebugName = potentialVariableName;
        }

        const filePath = this.file.opts.filename;
        const cwd = this.file.opts.cwd ?? '';
        const projectFilePath = filePath.replace(cwd, '');
        const { line, column } = path.node.loc.start;

        const sid = hashCode(`${projectFilePath}:${line}:${column}`);

        const name = `${additionalDebugName}__${sid}`;

        args[0].properties.unshift(t.objectProperty(t.identifier('name'), t.stringLiteral(name)));
      },
    },
  };
};

export default fillDeclareActionName;
