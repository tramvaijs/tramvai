import { DI_TOKEN, commandLineListTokens, provide } from '@tramvai/core';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';

type DiRecord = {
  factory?: Function;
  resolvedDeps?: Record<string, any>;
  multi?: any[];
  scope: 'request' | 'singleton';
  stack: string;
};

type Node = {
  name: string;
  record: DiRecord;
  parents: Set<Node>;
  children: Set<Node>;
};

// transform "Symbol(token)" to human readable "token"
function tokenToString(token: symbol): string {
  return token.toString().replace(/^Symbol\((.+)\)$/, '$1');
}

function traverseUp(
  node: Node,
  path: Node[],
  callback: (node: Node, path: Node[]) => false | void
) {
  const parents = Array.from(node.parents);

  parents.forEach((parentNode) => {
    const pathCopy = [...path];

    pathCopy.push(node);

    const stop = callback(parentNode, pathCopy) === false;

    if (!stop) {
      traverseUp(parentNode, pathCopy, callback);
    }
  });
}

/**
 * Usage of "Request" scoped dependencies in "Singleton" providers can lead to errors,
 * for example usage of `DispatcherContext` in `commandLineListTokens.init` is meaningless
 * - for this case one specific `DispatcherContext` instance will be created and cached in `init` deps.
 *
 * In a future, we have plan to prohibit usage of "Request" dependencies inside "Singleton" providers.
 * For now, we will detect such cases and log an error in development mode.
 */
function detectDiScopesCollisions({
  di,
  logger,
}: {
  di: typeof DI_TOKEN;
  logger: typeof LOGGER_TOKEN;
}) {
  const log = logger('di-validator');
  const collisions = new Map<string, Set<{ record: DiRecord; paths: Node[] }>>();
  // eslint-disable-next-line prefer-destructuring
  const diRecords: Map<symbol, DiRecord> = (di as any).records;
  const nodes: Map<DiRecord, Node> = new Map();

  diRecords.forEach((rootRecord, rootTokenName) => {
    const rootTokenStr = tokenToString(rootTokenName);

    if (rootRecord.multi) {
      rootRecord.multi.forEach((rootMultiRecord) => {
        processRootRecord(rootMultiRecord);
      });
    } else {
      processRootRecord(rootRecord);
    }

    function processRootRecord(rootRecord: DiRecord) {
      if (!nodes.has(rootRecord)) {
        nodes.set(rootRecord, {
          name: rootTokenStr,
          record: rootRecord,
          parents: new Set(),
          children: new Set(),
        });
      }

      // create dependencies graph from flat list
      walkOverDepsRecords(rootRecord, createAndConnectNodes);

      // looking for request deps, used in singleton providers
      walkOverDepsRecords(rootRecord, checkCollision);
    }

    function createAndConnectNodes(name: string, record: DiRecord, rootRecord: DiRecord) {
      if (!nodes.has(record)) {
        nodes.set(record, {
          name,
          record,
          parents: new Set(),
          children: new Set(),
        });
      }

      nodes.get(record)!.parents.add(nodes.get(rootRecord)!);
      nodes.get(rootRecord)!.children.add(nodes.get(record)!);
    }

    function checkCollision(name: string, record: DiRecord) {
      if (record.scope !== 'request' || !record.factory || collisions.has(name)) {
        return;
      }

      let collision = false;
      let collisionPaths: Node[] = [];

      traverseUp(nodes.get(record)!, [], (node, paths) => {
        if (collision) {
          return;
        }

        const isSingleton = node.record.scope === 'singleton';

        if (isSingleton) {
          paths.push(node);

          collision = true;
          collisionPaths = paths.reverse();

          // it is enough to detect first collision and stop traverse
          return false;
        }
      });

      if (collision) {
        if (!collisions.has(name)) {
          collisions.set(name, new Set());
        }
        collisions.get(name)!.add({ record, paths: collisionPaths });
      }
    }

    function walkOverDepsRecords(
      rootRecord: DiRecord,
      callback: (name: string, record: DiRecord, rootRecord: DiRecord) => void
    ) {
      const resolvedDepsList = Object.values(rootRecord.resolvedDeps ?? {});

      resolvedDepsList.forEach((token) => {
        const tokenObj = token.token || token;
        const tokenName = typeof tokenObj === 'string' ? Symbol.for(tokenObj) : tokenObj.name;
        const tokenStr = tokenToString(tokenName);
        const tokenRecord = di.getRecord(tokenName) as DiRecord;

        if (!tokenRecord) {
          return;
        }

        if (tokenRecord.multi) {
          tokenRecord.multi.forEach((multiRecord) => {
            callback(tokenStr, multiRecord, rootRecord);
          });
        } else {
          callback(tokenStr, tokenRecord, rootRecord);
        }
      });
    }
  });

  collisions.forEach((records, key) => {
    const recordsArr = Array.from(records.values());
    const { record, paths } = recordsArr[0] ?? {};

    let message = `\nIncorrect usage of "${key}" - token has Request scope, but requested in Singleton scoped provider.
Requested dependency path: \n    ${paths.map((path) => path.name).join(' -> ')}\n`;

    if (record.stack) {
      message += `Request token stack trace: \n    ${
        record.stack.split('\n')[1]?.trim() ?? 'unknown'
      }`;
    }

    const root = paths[0];

    if (root.record.stack) {
      message += `\nSingleton token stack trace: \n    ${
        root.record.stack.split('\n')[1]?.trim() ?? 'unknown'
      }`;
    }

    log.error(message);
  });
}

export const providers =
  process.env.NODE_ENV === 'development'
    ? [
        provide({
          provide: commandLineListTokens.listen,
          useFactory: (deps) => {
            return () => {
              detectDiScopesCollisions(deps);
            };
          },
          deps: {
            di: DI_TOKEN,
            logger: LOGGER_TOKEN,
          },
        }),
      ]
    : [];
