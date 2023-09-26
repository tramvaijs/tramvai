import type { Api } from '@tramvai/tools-migrate';
import type { CallExpression, ASTPath, Collection, JSCodeshift } from 'jscodeshift';

const createQueryModuleSpecifier = '@tramvai/react-query';
const createQueryImportSpecifier = 'createQuery';
const creatInfiniteQueryImportSpecifier = 'createInfiniteQuery';

function searchForImports(j: JSCodeshift, parsed: Collection<any>, importSpecifierName: string) {
  const result = {
    isImported: false,
    isImportedByName: false,
    importedName: importSpecifierName,
    importedDefaultName: '',
  };

  parsed
    .find(j.ImportDeclaration, { source: { value: createQueryModuleSpecifier } })
    .forEach((importDeclaration) => {
      result.isImported = true;

      if (importDeclaration.value.specifiers) {
        importDeclaration.value.specifiers.forEach((specifier) => {
          // Default imports
          if (specifier.type === 'ImportDefaultSpecifier') {
            result.importedDefaultName = specifier.local?.name ?? '';
            return;
          }

          // Named imports
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === importSpecifierName
          ) {
            result.isImportedByName = true;

            // Named with overriding local name
            if (specifier.local?.name) {
              result.importedName = specifier.local.name;
            }
          }
        });
      }
    });

  return result;
}
// eslint-disable-next-line import/no-default-export
export default async (api: Api) => {
  await api.transform(({ source }, { j }, { printOptions }) => {
    const parsed = j(source);

    // ---------------- SEARCHING FOR THE RIGHT IMPORTS ------------------

    const createQueryImport = searchForImports(j, parsed, createQueryImportSpecifier);
    const createInfiniteQueryImport = searchForImports(
      j,
      parsed,
      creatInfiniteQueryImportSpecifier
    );

    // -----------------------------------------------------------------

    // ------- FUNCTION TO VALIDATE AND APPLY CHANGES IN PROPERTIES OF CALL EXPRESSION --------
    let hasChanged = false;
    const forEachCallExpression = (callExpression: ASTPath<CallExpression>) => {
      const firstArgument = callExpression.value.arguments[0];
      let shouldAddActionNamePostfix = false;
      let isObjectAlreadyHasActionNamePostfix = false;

      if (!(firstArgument && firstArgument.type === 'ObjectExpression')) return;

      firstArgument.properties.forEach((property) => {
        // for arrow function in property
        if (
          property.type === 'ObjectProperty' &&
          property.key.type === 'Identifier' &&
          property.key.name === 'key' &&
          property.value.type === 'ArrowFunctionExpression'
        ) {
          shouldAddActionNamePostfix = true;
        }

        // for method property
        if (
          property.type === 'ObjectMethod' &&
          property.key.type === 'Identifier' &&
          property.key.name === 'key'
        ) {
          shouldAddActionNamePostfix = true;
        }

        if (
          property.type === 'ObjectProperty' &&
          property.key.type === 'Identifier' &&
          property.key.name === 'actionNamePostfix'
        ) {
          isObjectAlreadyHasActionNamePostfix = true;
        }

        return property;
      });

      if (
        shouldAddActionNamePostfix &&
        !isObjectAlreadyHasActionNamePostfix &&
        callExpression.parent.value.type === 'VariableDeclarator'
      ) {
        hasChanged = true;
        j(callExpression).replaceWith(
          j.callExpression(callExpression.value.callee, [
            j.objectExpression([
              ...firstArgument.properties,
              j.objectProperty(
                j.identifier('actionNamePostfix'),
                j.stringLiteral(callExpression.parent.value.id.name)
              ),
            ]),
          ])
        );
      }
    };
    // ---------------------------------------------------------------------

    // --------- INITIATION OF RECOGNIZING CALL EXPRESSION WITH REQUIRED PROPERTIES ---------
    if (createQueryImport.isImported) {
      if (createQueryImport.isImportedByName) {
        parsed
          .find(j.CallExpression, { callee: { name: createQueryImport.importedName } })
          .forEach(forEachCallExpression);
      }

      if (createQueryImport.importedDefaultName) {
        parsed
          .find(j.CallExpression, {
            callee: {
              object: {
                name: createQueryImport.importedDefaultName,
              },
              property: {
                name: createQueryImportSpecifier,
              },
            },
          })
          .forEach(forEachCallExpression);
      }
    }

    if (createInfiniteQueryImport.isImported) {
      if (createInfiniteQueryImport.isImportedByName) {
        parsed
          .find(j.CallExpression, { callee: { name: createInfiniteQueryImport.importedName } })
          .forEach(forEachCallExpression);
      }

      if (createInfiniteQueryImport.importedDefaultName) {
        parsed
          .find(j.CallExpression, {
            callee: {
              object: {
                name: createInfiniteQueryImport.importedDefaultName,
              },
              property: {
                name: creatInfiniteQueryImportSpecifier,
              },
            },
          })
          .forEach(forEachCallExpression);
      }
    }
    // ---------------------------------------------------------------------------

    // --------- CHANGING FILES ---------------
    if (hasChanged) {
      return parsed.toSource(printOptions);
    }
    // ----------------------------------------
  });
};
