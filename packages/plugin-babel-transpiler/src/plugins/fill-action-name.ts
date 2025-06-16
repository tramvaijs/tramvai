const actionOrServiceRe = /[\\/](actions|services)[\\/]/;
const contextRe = /[\\/](Client)?Context.[jt]s$/;

/** @deprecated */
module.exports = function plugin({ types }: { types: any }) {
  function getAssignStatement(node: any) {
    if (!node || !node.name) {
      return;
    }

    return types.expressionStatement(
      types.assignmentExpression(
        '=',
        types.memberExpression(types.identifier(node.name), types.identifier('i')),
        types.stringLiteral(node.name)
      )
    );
  }

  function fillAllowed(node: any) {
    const allowed = !node.alreadyFilled;
    // eslint-disable-next-line no-param-reassign
    node.alreadyFilled = true;
    return allowed;
  }

  function fillNameBefore(parent: any, node: any) {
    const statement = getAssignStatement(node);

    if (statement && fillAllowed(node)) {
      parent.insertBefore(statement);
    }
  }

  function fillNameAfter(parent: any, node: any) {
    const statement = getAssignStatement(node);

    if (statement && fillAllowed(node)) {
      parent.insertAfter(statement);
    }
  }

  function isActionOrService(state: any) {
    if (process.env.TEST) return true;
    const { filename } = state.file.opts;

    return actionOrServiceRe.test(filename);
  }

  function findTopStatementPath(path: any) {
    // eslint-disable-next-line no-param-reassign
    while (path.parentPath.type !== 'Program') path = path.parentPath;
    return path;
  }

  function fillNameForNode(statementPath: any, node: any) {
    if (node.type === 'FunctionDeclaration') {
      fillNameAfter(statementPath, node.id);
    } else if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((declarator: any) => {
        if (types.isFunction(declarator.init)) {
          fillNameAfter(statementPath, declarator.id);
        }
      });
    } else if (node.type === 'VariableDeclarator') {
      if (types.isFunction(node.init)) {
        fillNameAfter(statementPath, node.id);
      }
    }
  }

  return {
    visitor: {
      ExportNamedDeclaration: {
        exit(path: any, state: any) {
          if (!isActionOrService(state)) return;

          const { node } = path;
          if (node.declaration) {
            fillNameForNode(path, node.declaration);
          }
        },
      },
      ExportDefaultDeclaration: {
        exit(path: any, state: any) {
          if (!isActionOrService(state)) return;

          const { declaration } = path.node;

          if (declaration.type === 'Identifier') {
            const binding = path.scope.getBinding(declaration.name);

            if (binding) {
              fillNameForNode(findTopStatementPath(binding.path), binding.path.node);
            }
          }

          if (declaration.type === 'FunctionDeclaration') {
            fillNameAfter(path, declaration.id);
          }

          if (declaration.type === 'CallExpression') {
            fillNameBefore(path, declaration.arguments[0]);
          }
        },
      },
      Program: {
        exit(path: any, state: any) {
          const { filename } = state.file.opts;

          if (!contextRe.test(filename)) {
            return;
          }

          path.traverse({
            Identifier(idPath: any) {
              if (idPath.node.name === 'name' && idPath.parent.type === 'MemberExpression') {
                idPath.replaceWith(types.identifier('i'));
              }
            },
          });
        },
      },
    },
  };
};
