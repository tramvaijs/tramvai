const fs = require('fs');
const os = require('os');
const path = require('path');

const tmpFilePath = path.resolve(os.tmpdir(), 'changedFiles.json');
const FRAGMENT = 'Fragment';
let filesChanged: { name: string; files: string[] } | null;

try {
  if (process.env.ADD_VERSION_ATTRIBUTE_FOR_JSX) {
    filesChanged = JSON.parse(process.env.ADD_VERSION_ATTRIBUTE_FOR_JSX);
  }
  if (fs.existsSync(tmpFilePath)) {
    filesChanged = JSON.parse(fs.readFileSync(tmpFilePath, 'utf8'));
  }
} catch (e) {
  filesChanged = null;
}

function attrName(attr: any) {
  return attr.name && attr.name.name;
}

function attrValue(attr: any) {
  return attr.value && attr.value.value;
}

function isEqualAttr(attr1: any, attr2: any) {
  if (!attr1 || !attr2) {
    return false;
  }
  return attrName(attr1) === attrName(attr2) && attrValue(attr1) === attrValue(attr2);
}

// Не будем проставлять data-qa-атрибуты в случае использования React.Fragment
// На данный момент поддерживаются 2 вида синтаксисов: <Fragment> и <React.Fragment>
function isOpeningElementFragment(element: any) {
  if (!element.name) {
    return false;
  }

  return (
    (element.name.property && element.name.property.name === FRAGMENT) ||
    element.name.name === FRAGMENT
  );
}

function isCallExpressionFragment(nodeArguments: any) {
  if (!nodeArguments[0]) {
    return false;
  }

  return (
    (nodeArguments[0].property && nodeArguments[0].property.name === FRAGMENT) ||
    nodeArguments[0].name === FRAGMENT
  );
}

const getBaseName = (filename: any) => {
  return path.basename(filename, path.extname(filename));
};

/** @deprecated */
function babelPluginReactElementInfo({ types: t }: { types: any }) {
  const defaultPrefix = 'data-qa';
  let prefix;
  let filenameAttr: any;
  let changedVersionAttr: any;

  const visitor = {
    Program(nodePath: any, state: any) {
      if (state.opts.prefix) {
        prefix = `data-${state.opts.prefix}`;
      } else {
        prefix = defaultPrefix;
      }

      changedVersionAttr = `${prefix}-changed-version`;
      filenameAttr = `${prefix}-file`;
    },
    JSXOpeningElement(nodePath: any, state: any) {
      const { openingElement } = nodePath.container;
      const { attributes } = openingElement;
      const newAttributes = [];
      const isFragment = isOpeningElementFragment(openingElement);

      if (
        !isFragment &&
        filesChanged &&
        state.file &&
        state.file.opts &&
        state.file.opts.sourceFileName &&
        filesChanged.files.includes(state.file.opts.sourceFileName)
      ) {
        newAttributes.push(
          t.jsxAttribute(t.jsxIdentifier(changedVersionAttr), t.stringLiteral(filesChanged.name))
        );
      }

      if (!isFragment && state.file && state.file.opts && state.file.opts.filename) {
        const name = getBaseName(state.file.opts.filename);
        const attrDataQaFile = t.jsxAttribute(t.jsxIdentifier(filenameAttr), t.stringLiteral(name));

        if (attributes.find((item: any) => isEqualAttr(item, attrDataQaFile)) === undefined) {
          newAttributes.push(attrDataQaFile);
        }
      }

      attributes.push(...newAttributes);
    },
    CallExpression(nodePath: any, state: any) {
      if (
        (nodePath.node.callee.type === 'MemberExpression' &&
          nodePath.node.callee.object.name === 'React' &&
          nodePath.node.callee.property.name === 'createElement') ||
        (nodePath.node.callee.type === 'Identifier' &&
          nodePath.node.callee.name === 'createElement')
      ) {
        const name = getBaseName(state.file.opts.filename);
        const properties = nodePath.node.arguments[1] && nodePath.node.arguments[1].properties;
        const isFragment = isCallExpressionFragment(nodePath.node.arguments);

        if (
          !isFragment &&
          properties &&
          !properties.find(
            (property: any) =>
              property.type === 'ObjectProperty' &&
              property.key.type === 'StringLiteral' &&
              property.key.value === filenameAttr
          )
        ) {
          properties.push(t.objectProperty(t.stringLiteral(filenameAttr), t.stringLiteral(name)));
        }
      }
    },
  };

  return {
    visitor,
  };
}

module.exports = babelPluginReactElementInfo;
