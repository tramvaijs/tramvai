import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { FileSystemCache } from './fileSystemCache';
import { StaticPagesCacheEntry } from '../tokens';

const createLogger = () => (name: string) => ({
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
});
// for debugging tests
// const createLogger = () => (name: string) => ({
//   trace: console.log.bind(console),
//   debug: console.log.bind(console),
//   info: console.log.bind(console),
//   warn: console.log.bind(console),
//   error: console.log.bind(console),
//   fatal: console.log.bind(console),
// });

const createMetrics = () => ({
  hit: { inc: jest.fn() },
  miss: { inc: jest.fn() },
  size: { set: jest.fn() },
  bytes: { set: jest.fn() },
});

const createCacheEntry = (
  html: string,
  options?: { headers?: Record<string, string | string[]>; status?: number }
) => {
  return {
    body: html,
    updatedAt: Date.now(),
    headers: options?.headers ?? {},
    status: options?.status ?? 200,
    source: 'fs',
  } satisfies StaticPagesCacheEntry;
};

describe('FileSystemCache', () => {
  let testDir: string;
  let cache: FileSystemCache;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(async () => {
    // Create unique temp directory for each test
    testDir = path.join(tmpdir(), `fs-cache-test-${Date.now()}-${Math.random()}`);
    await fs.mkdir(testDir, { recursive: true });

    logger = createLogger();

    cache = new FileSystemCache({
      directory: testDir,
      maxSize: 10,
      ttl: 60000,
      allowStale: true,
      logger: logger as any,
      metrics: createMetrics() as any,
    });
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('initialization', () => {
    it('should initialize with empty cache', async () => {
      await cache.init();
      expect(cache.size).toBe(0);
    });

    it('should scan existing files on init', async () => {
      // Create some HTML files
      await fs.mkdir(path.join(testDir, 'page1'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'page2'), { recursive: true });
      await fs.writeFile(path.join(testDir, 'index.html'), '<html>Home</html>');
      await fs.writeFile(path.join(testDir, 'page1', 'index.html'), '<html>Page 1</html>');
      await fs.writeFile(
        path.join(testDir, 'page1', 'index.mobile.html'),
        '<html>Page 1 Mobile</html>'
      );
      await fs.writeFile(path.join(testDir, 'page2', 'index.html'), '<html>Page 2</html>');

      await cache.init();

      expect(cache.size).toBe(4);
      expect(cache.has('/^')).toBe(true);
      expect(cache.has('/page1/^')).toBe(true);
      expect(cache.has('/page1/^mobile')).toBe(true);
      expect(cache.has('/page2/^')).toBe(true);
    });

    it('should handle non-existent directory gracefully', async () => {
      const nonExistentDir = path.join(testDir, 'does-not-exist');
      cache = new FileSystemCache({
        directory: nonExistentDir,
        maxSize: 10,
        ttl: 60000,
        allowStale: true,
        logger: logger as any,
        metrics: createMetrics() as any,
      });

      await expect(cache.init()).resolves.not.toThrow();
      expect(cache.size).toBe(0);
    });
  });

  describe('get/set operations', () => {
    beforeEach(async () => {
      await cache.init();
    });

    it('should set and get a cache entry', async () => {
      const entry = '<html>Test</html>';

      await cache.set('/test/^', createCacheEntry(entry));

      const result = await cache.get('/test/^');

      expect(result?.body).toBe(entry);
    });

    it('should set and get a cache entry with key', async () => {
      const entry = '<html>Test Mobile</html>';

      await cache.set('/test/^mobile', createCacheEntry(entry));

      const result = await cache.get('/test/^mobile');

      expect(result?.body).toBe(entry);
    });

    it('should return undefined for non-existent entry', async () => {
      const result = await cache.get('/does-not-exist/^');
      expect(result).toBeUndefined();
    });

    it('should update existing entry', async () => {
      const entry1 = '<html>Version 1</html>';

      await cache.set('/test/^', createCacheEntry(entry1));

      const entry2 = '<html>Version 2</html>';

      await cache.set('/test/^', createCacheEntry(entry2));

      const result = await cache.get('/test/^');

      expect(result?.body).toBe(entry2);
      expect(cache.size).toBe(1);
    });

    it('should handle multiple entries', async () => {
      await cache.set('/page1/^', createCacheEntry('<html>Page 1</html>'));
      await cache.set('/page2/^', createCacheEntry('<html>Page 2</html>'));
      await cache.set('/page3/^mobile', createCacheEntry('<html>Page 3 Mobile</html>'));

      expect(cache.size).toBe(3);

      const result1 = await cache.get('/page1/^');
      const result2 = await cache.get('/page2/^');
      const result3 = await cache.get('/page3/^mobile');

      expect(result1?.body).toBe('<html>Page 1</html>');
      expect(result2?.body).toBe('<html>Page 2</html>');
      expect(result3?.body).toBe('<html>Page 3 Mobile</html>');
    });
  });

  describe('headers and status metadata', () => {
    beforeEach(async () => {
      await cache.init();
    });

    it('should persist and return headers from .json metadata file', async () => {
      const headers = { 'content-type': 'text/html', 'x-custom': 'value' };

      await cache.set('/test/^', createCacheEntry('<html>Test</html>', { headers }));

      const result = await cache.get('/test/^');

      expect(result?.headers).toEqual(headers);
    });
    it('should persist and return status code from .json metadata file', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Not Found</html>', { status: 404 }));

      const result = await cache.get('/test/^');

      expect(result?.status).toBe(404);
    });

    it('should persist and return 3xx status with Location header', async () => {
      await cache.set(
        '/redirect/^',
        createCacheEntry('', {
          status: 301,
          headers: { Location: '/new-location/' },
        })
      );

      const result = await cache.get('/redirect/^');

      expect(result?.status).toBe(301);
      expect(result?.headers).toEqual({ Location: '/new-location/' });
    });

    it('should persist and return 5xx status', async () => {
      await cache.set(
        '/error/^',
        createCacheEntry('<html>Error</html>', {
          status: 500,
          headers: { 'x-error': 'true' },
        })
      );
      const result = await cache.get('/error/^');

      expect(result?.status).toBe(500);
      expect(result?.headers).toEqual({ 'x-error': 'true' });
    });

    it('should write .json metadata file alongside .html file', async () => {
      const headers = { 'x-custom': 'test-value' };

      await cache.set('/test/^', createCacheEntry('<html>Test</html>', { headers, status: 201 }));

      const metaFilePath = path.join(testDir, 'test', 'index.json');
      const metaContent = JSON.parse(await fs.readFile(metaFilePath, 'utf-8'));

      expect(metaContent).toEqual({
        headers: { 'x-custom': 'test-value' },
        status: 201,
      });
    });

    it('should write .json metadata file with key variation', async () => {
      const headers = { 'x-device': 'mobile' };

      await cache.set(
        '/test/^mobile',
        createCacheEntry('<html>Mobile</html>', { headers, status: 200 })
      );

      const metaFilePath = path.join(testDir, 'test', 'index.mobile.json');
      const metaContent = JSON.parse(await fs.readFile(metaFilePath, 'utf-8'));

      expect(metaContent).toEqual({
        headers: { 'x-device': 'mobile' },
        status: 200,
      });
    });

    it('should delete .json metadata file when cache entry is deleted', async () => {
      await cache.set(
        '/test/^',
        createCacheEntry('<html>Test</html>', {
          headers: { 'x-custom': 'value' },
        })
      );

      const metaFilePath = path.join(testDir, 'test', 'index.json');
      // verify json file exists
      await expect(fs.access(metaFilePath)).resolves.not.toThrow();

      await cache.delete('/test/^');

      // both html and json should be deleted
      await expect(fs.access(metaFilePath)).rejects.toThrow();
      await expect(fs.access(path.join(testDir, 'test', 'index.html'))).rejects.toThrow();
    });

    it('should return empty headers when .json has empty headers', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Test</html>', { headers: {} }));

      const result = await cache.get('/test/^');

      expect(result?.headers).toEqual({});
      expect(result?.status).toBe(200);
    });

    it('should handle headers with array values', async () => {
      const headers = { 'set-cookie': ['a=1', 'b=2'] };

      await cache.set(
        '/test/^',
        createCacheEntry('<html>Test</html>', { headers: headers as any })
      );

      const result = await cache.get('/test/^');

      expect(result?.headers).toEqual({ 'set-cookie': ['a=1', 'b=2'] });
    });

    it('should return undefined when .json metadata file is missing', async () => {
      await cache.set(
        '/test/^',
        createCacheEntry('<html>Test</html>', {
          headers: { 'x-custom': 'value' },
        })
      );

      // delete only the json file to simulate corruption
      const metaFilePath = path.join(testDir, 'test', 'index.json');
      await fs.unlink(metaFilePath);

      const result = await cache.get('/test/^');
      expect(result).toBeUndefined();
    });

    it('should return undefined when .json metadata file is corrupted', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      // corrupt the json file
      const metaFilePath = path.join(testDir, 'test', 'index.json');
      await fs.writeFile(metaFilePath, 'not valid json{{{');

      const result = await cache.get('/test/^');
      expect(result).toBeUndefined();
    });

    it('should update headers and status when overwriting a cache entry', async () => {
      await cache.set(
        '/test/^',
        createCacheEntry('<html>V1</html>', {
          headers: { 'x-version': '1' },
          status: 200,
        })
      );

      await cache.set(
        '/test/^',
        createCacheEntry('<html>V2</html>', {
          headers: { 'x-version': '2', 'x-new': 'header' },
          status: 201,
        })
      );

      const result = await cache.get('/test/^');

      expect(result?.body).toBe('<html>V2</html>');
      expect(result?.headers).toEqual({ 'x-version': '2', 'x-new': 'header' });
      expect(result?.status).toBe(201);
    });
  });

  describe('LRU eviction', () => {
    beforeEach(async () => {
      cache = new FileSystemCache({
        directory: testDir,
        maxSize: 3, // Small size for testing eviction
        ttl: 60000,
        allowStale: true,
        logger: logger as any,
        metrics: createMetrics() as any,
      });
      await cache.init();
    });

    it('should evict least recently used entry when max size is reached', async () => {
      await cache.set('/page1/^', createCacheEntry('<html>1</html>'));
      await cache.set('/page2/^', createCacheEntry('<html>2</html>'));
      await cache.set('/page3/^', createCacheEntry('<html>3</html>'));

      expect(cache.size).toBe(3);

      // Add 4th entry, should evict /page1/
      await cache.set('/page4/^', createCacheEntry('<html>4</html>'));

      // wait for eviction to complete
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(cache.size).toBe(3);
      expect(cache.has('/page1/^')).toBe(false);
      expect(cache.has('/page2/^')).toBe(true);
      expect(cache.has('/page3/^')).toBe(true);
      expect(cache.has('/page4/^')).toBe(true);
    });

    it('should move accessed entry to front', async () => {
      await cache.set('/page1/^', createCacheEntry('<html>1</html>'));
      await cache.set('/page2/^', createCacheEntry('<html>2/html>'));
      await cache.set('/page3/^', createCacheEntry('<html>3</html>'));

      // Access page1, moving it to front
      await cache.get('/page1/^');

      // Add 4th entry, should evict /page2/ (now least recently used)
      await cache.set('/page4/^', createCacheEntry('<html>4</html>'));

      // wait for eviction to complete
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(cache.has('/page1/^')).toBe(true);
      expect(cache.has('/page2/^')).toBe(false);
      expect(cache.has('/page3/^')).toBe(true);
      expect(cache.has('/page4/^')).toBe(true);
    });
  });

  describe('TTL and stale handling', () => {
    it('should return undefined for expired entry when allowStale is false', async () => {
      cache = new FileSystemCache({
        directory: testDir,
        maxSize: 10,
        ttl: 100, // 100ms TTL
        allowStale: false,
        logger: logger as any,
        metrics: createMetrics() as any,
      });
      await cache.init();

      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = await cache.get('/test/^');
      expect(result).toBeUndefined();
    });

    it('should return stale entry when allowStale is true', async () => {
      cache = new FileSystemCache({
        directory: testDir,
        maxSize: 10,
        ttl: 100, // 100ms TTL
        allowStale: true,
        logger: logger as any,
        metrics: createMetrics() as any,
      });
      await cache.init();

      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = await cache.get('/test/^');
      expect(result?.body).toBe('<html>Test</html>');
    });
  });

  describe('delete and clear', () => {
    beforeEach(async () => {
      await cache.init();
    });

    it('should delete a cache entry', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      expect(cache.has('/test/^')).toBe(true);

      const deleted = await cache.delete('/test/^');

      expect(deleted).toBe(true);
      expect(cache.has('/test/^')).toBe(false);

      // File should be deleted
      const filePath = path.join(testDir, 'test', 'index.html');
      await expect(fs.access(filePath)).rejects.toThrow();
    });

    it('should return false when deleting non-existent entry', async () => {
      const deleted = await cache.delete('/does-not-exist/^');
      expect(deleted).toBe(false);
    });

    it('should clear all entries', async () => {
      await cache.set('/page1/^', createCacheEntry('<html>1</html>'));
      await cache.set('/page2/^', createCacheEntry('<html>2</html>'));
      await cache.set('/page3/^', createCacheEntry('<html>3</html>'));

      expect(cache.size).toBe(3);

      await cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.has('/page1/^')).toBe(false);
      expect(cache.has('/page2/^')).toBe(false);
      expect(cache.has('/page3/^')).toBe(false);
    });
  });

  describe('metrics', () => {
    it('should update metrics on operations', async () => {
      const metrics = createMetrics();

      cache = new FileSystemCache({
        directory: testDir,
        maxSize: 10,
        ttl: 60000,
        allowStale: true,
        logger: logger as any,
        metrics: metrics as any,
      });

      await cache.init();

      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      expect(metrics.size.set).toHaveBeenCalledWith(1);
      expect(metrics.bytes.set).toHaveBeenCalled();

      await cache.get('/test/^');
      expect(metrics.hit.inc).toHaveBeenCalled();

      await cache.get('/does-not-exist/^');
      expect(metrics.miss.inc).toHaveBeenCalled();
    });
  });

  describe('edge cases and error handling', () => {
    beforeEach(async () => {
      await cache.init();
    });

    it('should handle init with more files than maxSize', async () => {
      const smallCache = new FileSystemCache({
        directory: testDir,
        maxSize: 2,
        ttl: 60000,
        allowStale: true,
        logger: logger as any,
        metrics: createMetrics() as any,
      });

      await fs.mkdir(path.join(testDir, 'page1'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'page2'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'page3'), { recursive: true });
      await fs.writeFile(path.join(testDir, 'page1', 'index.html'), '<html>1</html>');
      await fs.writeFile(path.join(testDir, 'page2', 'index.html'), '<html>2</html>');
      await fs.writeFile(path.join(testDir, 'page3', 'index.html'), '<html>3</html>');

      await smallCache.init();

      expect(smallCache.size).toBe(2);
    });

    it('should handle stale entry cleanup asynchronously when allowStale is true', async () => {
      cache = new FileSystemCache({
        directory: testDir,
        maxSize: 10,
        ttl: 100, // 100ms TTL
        allowStale: true,
        logger: logger as any,
        metrics: createMetrics() as any,
      });
      await cache.init();

      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      // wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // should return stale entry
      const result = await cache.get('/test/^');
      expect(result?.body).toBe('<html>Test</html>');

      // entry should still be in cache immediately after
      expect(cache.has('/test/^')).toBe(true);

      // wait for async cleanup to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // entry should be deleted after async cleanup
      expect(cache.has('/test/^')).toBe(false);
    });

    it('should handle file read error gracefully', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      // delete the file directly to simulate read error
      const filePath = path.join(testDir, 'test', 'index.html');
      await fs.unlink(filePath);

      // should return undefined when file cannot be read
      const result = await cache.get('/test/^');
      expect(result).toBeUndefined();
    });

    it('should handle file write error gracefully', async () => {
      // make directory read-only to cause write error
      const readOnlyDir = path.join(testDir, 'readonly');
      await fs.mkdir(readOnlyDir, { recursive: true });
      await fs.chmod(readOnlyDir, 0o444); // read-only

      const readOnlyCache = new FileSystemCache({
        directory: readOnlyDir,
        maxSize: 10,
        ttl: 60000,
        allowStale: true,
        logger: logger as any,
        metrics: createMetrics() as any,
      });
      await readOnlyCache.init();

      // should not throw when write fails
      await expect(
        readOnlyCache.set('/test/^', createCacheEntry('<html>Test</html>'))
      ).resolves.not.toThrow();

      // restore permissions for cleanup
      await fs.chmod(readOnlyDir, 0o755);
    });

    it('should handle file delete error gracefully', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      // delete the file directly
      const filePath = path.join(testDir, 'test', 'index.html');
      await fs.unlink(filePath);

      // should not throw when file is already deleted
      const deleted = await cache.delete('/test/^');
      expect(deleted).toBe(true);
    });

    it('should handle moveToHead when entry is already at head', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Test</html>'));

      // get twice - second get should be no-op for moveToHead
      await cache.get('/test/^');
      await cache.get('/test/^');

      expect(cache.has('/test/^')).toBe(true);
    });

    it('should ignore non-HTML files during init', async () => {
      // Create HTML and non-HTML files
      await fs.writeFile(path.join(testDir, 'index.html'), '<html>Home</html>');
      await fs.writeFile(path.join(testDir, 'data.json'), '{}');
      await fs.writeFile(path.join(testDir, 'style.css'), 'body {}');
      await fs.writeFile(path.join(testDir, 'script.js'), 'console.log()');

      await cache.init();

      // should only load HTML files
      expect(cache.size).toBe(1);
      expect(cache.has('/^')).toBe(true);
    });
    it('should handle deeply nested paths', async () => {
      await cache.set('/a/b/c/d/e/^', createCacheEntry('<html>Deep</html>'));

      const result = await cache.get('/a/b/c/d/e/^');

      expect(result?.body).toBe('<html>Deep</html>');

      const filePath = path.join(testDir, 'a', 'b', 'c', 'd', 'e', 'index.html');
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });

    it('should handle multiple cache keys for same pathname', async () => {
      await cache.set('/test/^', createCacheEntry('<html>Desktop</html>'));
      await cache.set('/test/^mobile', createCacheEntry('<html>Mobile</html>'));
      await cache.set('/test/^tablet', createCacheEntry('<html>Tablet</html>'));

      expect(cache.size).toBe(3);

      const desktop = await cache.get('/test/^');
      const mobile = await cache.get('/test/^mobile');
      const tablet = await cache.get('/test/^tablet');

      expect(desktop?.body).toBe('<html>Desktop</html>');
      expect(mobile?.body).toBe('<html>Mobile</html>');
      expect(tablet?.body).toBe('<html>Tablet</html>');
    });

    it('should handle stale entry that becomes fresh again', async () => {
      cache = new FileSystemCache({
        directory: testDir,
        maxSize: 10,
        ttl: 100, // 100ms TTL
        allowStale: false,
        logger: logger as any,
        metrics: createMetrics() as any,
      });
      await cache.init();

      await cache.set('/test/^', createCacheEntry('<html>Version 1</html>'));

      // wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));
      // should return undefined (expired)
      const result1 = await cache.get('/test/^');
      expect(result1).toBeUndefined();

      // set fresh entry
      await cache.set('/test/^', createCacheEntry('<html>Version 2</html>'));

      // should return fresh entry
      const result2 = await cache.get('/test/^');
      expect(result2?.body).toBe('<html>Version 2</html>');
    });

    it('should track metrics correctly across multiple operations', async () => {
      const metrics = createMetrics();
      cache = new FileSystemCache({
        directory: testDir,
        maxSize: 10,
        ttl: 60000,
        allowStale: true,
        logger: logger as any,
        metrics: metrics as any,
      });
      await cache.init();

      // set multiple entries
      await cache.set('/page1/^', createCacheEntry('<html>1</html>'));
      await cache.set('/page2/^', createCacheEntry('<html>22</html>'));
      await cache.set('/page3/^', createCacheEntry('<html>333</html>'));

      expect(metrics.size.set).toHaveBeenLastCalledWith(3);

      // verify bytes metric (sum of html lengths)
      const totalBytes =
        '<html>1</html>'.length + '<html>22</html>'.length + '<html>333</html>'.length;
      expect(metrics.bytes.set).toHaveBeenLastCalledWith(totalBytes);

      await cache.get('/page1/^');
      expect(metrics.hit.inc).toHaveBeenCalledTimes(1);

      await cache.get('/nonexistent/^');
      expect(metrics.miss.inc).toHaveBeenCalledTimes(1);

      await cache.delete('/page1/^');
      expect(metrics.size.set).toHaveBeenLastCalledWith(2);
    });
  });
});
