import fs from 'node:fs';
import path from 'node:path';

import pluginTester, { PluginTesterOptions } from 'babel-plugin-tester';

const getMajorNodeVersion = () => Number(process.version.slice(1).split('.')[0]);
const isTypescriptSupported = () => getMajorNodeVersion() > 21;

export function patchedPluginTester(testDirname: string, options: PluginTesterOptions) {
  if (isTypescriptSupported()) {
    pluginTester(options);
  } else {
    // Jest failed when it finds obsolete snapshots,
    // so we run empty tests that compare each snapshot with itself to make Jest treat it as “used.”
    const { pluginName } = options;

    describe(`${pluginName}`, () => {
      const snapshotPath = path.join(testDirname, '__snapshots__', `${pluginName}.spec.ts.snap`);
      const snapshots = require(snapshotPath);

      for (const testName in options.tests) {
        test(`${testName}`, () => {
          const snapshotKey = Object.keys(snapshots).find((item) => item.includes(testName));
          expect(snapshots[snapshotKey!].slice(1, -1)).toMatchSnapshot(testName);
        });
      }
    });
  }
}
