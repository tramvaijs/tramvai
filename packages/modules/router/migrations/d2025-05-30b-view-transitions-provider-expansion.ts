import type { Api } from '@tramvai/tools-migrate';
// eslint-disable-next-line import/no-extraneous-dependencies,no-restricted-imports
import { addImport } from '@tramvai/tools-migrate/lib/transform/import';
import type {
  ArrayExpression,
  JSCodeshift,
  ObjectExpression,
  ObjectProperty,
  Collection,
  Identifier,
} from 'jscodeshift';

const TOKEN_NAME = 'ROUTER_VIEW_TRANSITIONS_ENABLED';
const MODULE_IMPORT = '@tramvai/module-router';

const checkForExistingProvider = (providersArray: ArrayExpression): boolean => {
  return providersArray.elements.some((element) => {
    if (
      element &&
      element.type === 'CallExpression' &&
      element.callee.type === 'Identifier' &&
      element.callee.name === 'provide'
    ) {
      const configArg = element.arguments[0];
      if (configArg && configArg.type === 'ObjectExpression') {
        return (configArg.properties as ObjectProperty[]).some(
          (prop) =>
            (prop.key as Identifier).name === 'provide' &&
            prop.value.type === 'Identifier' &&
            prop.value.name === TOKEN_NAME
        );
      }
    }
    return false;
  });
};

const addNewProvider = (providersArray: ArrayExpression, j: JSCodeshift) => {
  const newProvider = j.callExpression(j.identifier('provide'), [
    j.objectExpression([
      j.property('init', j.identifier('provide'), j.identifier(TOKEN_NAME)),
      j.property('init', j.identifier('useValue'), j.literal(true)),
    ]),
  ]);

  providersArray.elements.push(newProvider);
};

const processConfigObject = (
  configObject: ObjectExpression,
  parsed: Collection,
  j: JSCodeshift
) => {
  const providersProperty = configObject.properties.find(
    (prop) =>
      prop.type === 'ObjectProperty' &&
      prop.key.type === 'Identifier' &&
      prop.key.name === 'providers'
  ) as ObjectProperty;

  if (providersProperty && providersProperty.value.type === 'ArrayExpression') {
    const providersArray = providersProperty.value;

    const hasExistingProvider = checkForExistingProvider(providersArray);

    if (!hasExistingProvider) {
      addNewProvider(providersArray, j);
      addImport.call(
        parsed,
        j.importDeclaration([j.importSpecifier(j.identifier(TOKEN_NAME))], j.literal(MODULE_IMPORT))
      );
      return true;
    }
  }
  return false;
};

export default async (api: Api) => {
  await api.transform(({ source }, { j }, { printOptions }) => {
    const config = api.tramvaiJSON.source;
    const isVTEnabled = Object.values(config.projects).some((project) => {
      return project.experiments && project.experiments.viewTransitions;
    });
    if (!isVTEnabled) return;
    let isProcessed = false;
    const parsed = j(source);

    const callExpressions = parsed.find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'createApp',
      },
    });
    callExpressions.forEach((path) => {
      const callExpression = path.value;
      if (
        callExpression.arguments.length > 0 &&
        callExpression.arguments[0].type === 'ObjectExpression'
      ) {
        const configObject = callExpression.arguments[0];
        isProcessed = processConfigObject(configObject, parsed, j);
      }
    });
    if (callExpressions.length && isProcessed) {
      return parsed.toSource(printOptions);
    }
  });
};
