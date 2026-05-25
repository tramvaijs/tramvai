import fs from 'node:fs/promises';

import { test } from './performance-profile.fixture';

test.describe('Performance Profile Module', () => {
  test.describe('Memory Snapshot', () => {
    test('Should create memory snapshot', async ({ app }) => {
      const response1 = await app.papi.privatePapi('takeMemorySnapshot').expect(200);

      test.expect(response1.text).toBe('Creating snapshot for app');

      const snapshotFilePath = '/tmp/heapdump-app.heapsnapshot';

      let response2: any;

      await test.expect
        .poll(async () => {
          response2 = await app.papi.privatePapi('getMemorySnapshot');
          return response2.status;
        })
        .toBe(200);

      const snapshot = JSON.parse(response2.body.toString('utf-8'));

      test.expect(snapshot).toHaveProperty('snapshot');
      test.expect(snapshot).toHaveProperty('nodes');
      test.expect(snapshot).toHaveProperty('edges');
      test.expect(snapshot).toHaveProperty('strings');

      test.expect(snapshot.nodes.length).toBeGreaterThan(0);
      test.expect(snapshot.edges.length).toBeGreaterThan(0);
      test.expect(snapshot.strings.length).toBeGreaterThan(0);

      // ensure that temp snapshot file was deleted after reading
      await test.expect
        .poll(async () => {
          try {
            await fs.access(snapshotFilePath);
            return true;
          } catch (err) {
            return false;
          }
        })
        .toBe(false);
    });
  });

  test.describe('CPU Profile', () => {
    test('Should create CPU profile with custom duration', async ({ app }) => {
      const duration = 1000;
      const startTime = Date.now();

      const response = await app.papi.privatePapi(`getCpuProfile?duration=${duration}`).expect(200);

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      test.expect(elapsed).toBeGreaterThanOrEqual(duration);

      test.expect(response.headers['content-type']).toContain('application/octet-stream');

      const profile = JSON.parse(response.body.toString('utf-8'));

      test.expect(profile).toHaveProperty('nodes');
      test.expect(profile).toHaveProperty('samples');
      test.expect(profile).toHaveProperty('timeDeltas');

      test.expect(profile.nodes.length).toBeGreaterThan(0);
      test.expect(profile.samples.length).toBeGreaterThan(0);
    });
  });
});
