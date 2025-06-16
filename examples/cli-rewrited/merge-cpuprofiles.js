/**
 * Profile.
 *
 * https://chromedevtools.github.io/devtools-protocol/1-2/Profiler#type-Profile
 * https://chromium.googlesource.com/v8/v8/+/master/src/inspector/js_protocol.json#1421
 *
 * @typedef {Object} Profile
 * @property {Array.<ProfileNode>} nodes - The list of profile nodes. First item is the root node.
 * @property {Number} startTime - Profiling start timestamp in microseconds.
 * @property {Number} endTime - Profiling end timestamp in microseconds.
 * @property {Array.<Number>} [samples] - Ids of samples top nodes.
 * @property {Array.<Number>} timeDeltas - Time intervals between adjacent samples in microseconds.
 *     The first delta is relative to the profile startTime.
 */

/**
 * @typedef {Object} CpuProfileTree
 * @property {Object.<ProfileNode>} nodes
 * @property {Number} startTime
 * @property {Number} endTime
 * @property {Array.<Number>} samples
 * @property {Array.<Number>} timeDeltas
 */

/**
 * Profile node. Holds callsite information, execution statistics and child nodes.
 *
 * https://chromium.googlesource.com/v8/v8/+/master/src/inspector/js_protocol.json#1374
 *
 * @typedef {Object} ProfileNode
 * @property {Number} id - Unique id of the node.
 * @property {CallFrame} callFrame - Function location.
 * @property {Number} [hitCount] - Number of samples where this node was on top of the call stack.
 * @property {Array.<Number>} [children] - Child node ids.
 * @property {Array.<PositionTickInfo>} positionTicks - An array of source position ticks.
 *
 * Example:
 *
 * {
 *     id: 140,
 *     callFrame: {
 *         functionName: 'trigger',
 *         scriptId: '2273',
 *         url: 'https://v-homyakov-1-ws3.si.yandex.ru/static/web4/blocks-common/i-jquery/__core/jquery-2.1.4.js',
 *         lineNumber: 4262,
 *         columnNumber: 18
 *     },
 *     hitCount: 1,
 *     children: [141],
 *     positionTicks: [{ line: 4267, ticks: 1 }]
 * }
 */

/**
 * Stack entry for runtime errors and assertions.
 *
 * https://chromium.googlesource.com/v8/v8/+/master/src/inspector/js_protocol.json#2260
 *
 * @typedef {Object} CallFrame
 * @property {String} functionName - JavaScript function name.
 * @property {ScriptId} scriptId - JavaScript script id.
 * @property {String} url - JavaScript script name or url.
 * @property {Number} lineNumber - JavaScript script line number (0-based).
 * @property {Number} columnNumber - JavaScript script column number (0-based).
 */

/**
 * Unique script identifier.
 *
 * @typedef {String} ScriptId
 */

/**
 * Specifies a number of samples attributed to a certain source position.
 *
 * https://chromium.googlesource.com/v8/v8/+/master/src/inspector/js_protocol.json#1464
 *
 * @typedef {Object} PositionTickInfo
 * @property {Number} line - Source line number (1-based).
 * @property {Number} ticks - Number of samples attributed to the source line.
 */

/**
 * @param {Profile?} p1
 * @param {Profile} p2
 * @returns {Profile}
 */
function mergeProfiles(p1, p2) {
  if (!p1) {
    return p2;
  }

  let maxId = 0;
  p1.nodes.forEach((n, i) => {
    maxId = Math.max(maxId, i);
  });

  let nextId = maxId + 1;
  const nodeMapping = {};
  p2.nodes.forEach((node) => {
    nodeMapping[node.id] = nextId++;
  });

  p2.nodes.forEach((node) => {
    node.children = node.children?.map((id) => nodeMapping[id]) ?? [];

    if (node.id === 1) {
      // merge root entries
      p1.nodes[0].children = p1.nodes[0].children.concat(node.children);
      return;
    }

    node.id = nodeMapping[node.id];
    p1.nodes.push(node);
  });

  p1.endTime += p2.endTime - p2.startTime;
  p1.samples = p1.samples.concat(p2.samples.map((id) => nodeMapping[id]));
  // timeDeltas[0] contains strange big number (something for root?) so we skip it
  // but we need something to close sample from the previous profile - let it be zero
  p1.timeDeltas = p1.timeDeltas.concat(0, p2.timeDeltas.slice(1));

  return p1;
}

const fs = require('fs');

let /*Profile?*/ profile = null;

fs.readdirSync('./in')
  .filter((fn) => fn.endsWith('.cpuprofile'))
  .forEach((fn) => {
    const /*Profile*/ p = JSON.parse(fs.readFileSync(`./in/${fn}`));
    console.log(
      `${fn}: ${p.samples.length} samples, ${p.timeDeltas.length} deltas, ${p.endTime - p.startTime} time delta`
    );
    profile = mergeProfiles(profile, p);
  });

const resultFilename = './out/merged.cpuprofile';
fs.writeFileSync(resultFilename, JSON.stringify(profile), 'utf-8');
console.log(
  `Saved ${resultFilename} with ${profile.samples.length} samples, ${profile.timeDeltas.length} deltas, ${profile.endTime - profile.startTime} time delta`
);
