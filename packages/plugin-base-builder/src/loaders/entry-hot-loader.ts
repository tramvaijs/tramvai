import webpack from 'webpack';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import {
  isCallExpression,
  isIdentifier,
  identifier,
  variableDeclarator,
  variableDeclaration,
  exportNamedDeclaration,
} from '@babel/types';

// Transform entrypoint for server build
// createApp() => export const app = createApp()
// Used for hotReload in server-runner
// eslint-disable-next-line func-style
export const hotEntryLoader: webpack.LoaderDefinitionFunction<{}> = function hotEntryLoader(
  source
) {
  try {
    const ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      ExpressionStatement(path) {
        const expr = path.node.expression;

        if (isCallExpression(expr) && isIdentifier(expr.callee, { name: 'createApp' })) {
          path.replaceWith(
            exportNamedDeclaration(
              variableDeclaration('const', [variableDeclarator(identifier('app'), expr)])
            )
          );
        }
      },
    });

    return generate(ast, {
      retainLines: true,
      comments: true,
    }).code;
  } catch (err) {
    console.error('Failed to transform entrypoint for server hot reload!');
    return source;
  }
};

export default hotEntryLoader;
