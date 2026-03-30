import { promises as fs } from 'node:fs';
import path from 'node:path';
import pLimit from 'p-limit';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { DoubleLinkedList, ListNode } from '@tramvai/core';
import type { Counter, Gauge } from 'prom-client';
import { Route } from '@tinkoff/router';
import { parseCacheKey, getCacheKey } from '../utils/cacheKey';
import { StaticPagesCacheEntry } from '../tokens';

type Logger = ExtractDependencyType<typeof LOGGER_TOKEN>;

interface FileMetadata {
  filePath: string;
  pathname: string;
  key: string;
  cacheKey: string;
  size: number;
  mtime: number;
}

export type CacheMetrics = {
  hit: Counter;
  miss: Counter;
  size: Gauge;
  bytes: Gauge;
};

export interface FileSystemCacheOptions {
  /**
   * Directory where static HTML files are stored
   */
  directory: string;
  /**
   * Maximum number of files to keep in cache
   */
  maxSize: number;
  /**
   * TTL for cache entries in milliseconds
   */
  ttl: number;
  /**
   * Whether to allow stale entries to be returned
   */
  allowStale: boolean;
}

export class FileSystemCache {
  private directory: string;
  private maxSize: number;
  private ttl: number;
  private allowStale: boolean;
  private log: ReturnType<Logger>;

  private cache: Map<string, FileMetadata>;
  private list: DoubleLinkedList<string>;
  // save double linked list nodes for O(1) access when moving nodes
  private nodes: Map<string, ListNode<string>>;

  public staticPages: Route[];

  private metrics: CacheMetrics;
  private limit = pLimit(8);

  constructor({
    directory,
    maxSize,
    ttl,
    allowStale,
    logger,
    metrics,
  }: FileSystemCacheOptions & {
    metrics: CacheMetrics;
    logger: Logger;
  }) {
    this.directory = path.isAbsolute(directory) ? directory : path.join(process.cwd(), directory);
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.allowStale = allowStale;
    this.log = logger('static-pages:fs-cache');

    this.cache = new Map();
    this.list = new DoubleLinkedList();
    this.nodes = new Map();
    this.staticPages = [];

    this.metrics = metrics;
  }

  async init(): Promise<void> {
    this.log.info({
      event: 'init-start',
      directory: this.directory,
    });

    try {
      // fill zero values for metrics
      this.updateMetrics();

      await this.scanDirectory();

      this.log.info({
        event: 'init-complete',
        size: this.cache.size,
        totalBytes: this.getTotalBytes(),
      });

      this.updateMetrics();
    } catch (error) {
      if ((error as any)?.code === 'ENOENT') {
        // static directory path can be missing on first run, so always create it
        await fs.mkdir(this.directory, { recursive: true }).catch((mkdirError) => {
          this.log.warn({
            event: 'mkdir-error',
            message: `Failed to create static cache directory ${this.directory}, maybe read-only file system is used.
In k8s environment, it means that "readOnlyRootFilesystem" option is enabled for deployment, to fix this issue, add 'dist' directory as a emptyDir volume mount.`,
            error: mkdirError as Error,
          });
        });
      }

      this.log.warn({
        event: 'init-error',
        message:
          // static directory path includes unique build id in development mode, so warn only in production
          (error as any)?.code === 'ENOENT' && process.env.NODE_ENV !== 'development'
            ? `"${this.directory}" directory is not found. To effectively use file system cache, run "tramvai static {appName} --buildType=none" after application build,
and copy "dist/static" folder into the Docker image, to ensure the pages cache is populated on the first run.`
            : 'Failed to initialize file system cache',
        error: error as Error,
      });
    }
  }

  // eslint-disable-next-line max-statements
  async get(cacheKey: string): Promise<StaticPagesCacheEntry | undefined> {
    const metadata = this.cache.get(cacheKey);

    if (!metadata) {
      this.metrics.miss.inc();

      this.log.debug({
        event: 'get-miss',
        cacheKey,
      });

      return;
    }

    const isStale = Date.now() - metadata.mtime > this.ttl;

    if (isStale && !this.allowStale) {
      this.log.debug({
        event: 'get-miss',
        stale: true,
        cacheKey,
      });

      this.metrics.miss.inc();

      return;
    }

    // TODO: race condition protection, lock file or just return null?
    try {
      const html = await fs.readFile(metadata.filePath, 'utf-8');
      const response = JSON.parse(
        await fs.readFile(metadata.filePath.replace(/\.html$/, '.json'), 'utf-8')
      );

      // async cleanup stale entry, don't block response
      if (isStale) {
        setTimeout(() => {
          this.log.debug({
            event: 'delete-stale',
            cacheKey,
          });

          // eslint-disable-next-line @typescript-eslint/no-shadow
          const metadata = this.cache.get(cacheKey);

          if (metadata) {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const isStale = Date.now() - metadata.mtime > this.ttl;

            // prevent to delete entry if it was updated while timeout was waiting
            if (isStale) {
              this.delete(cacheKey);
            }
          }
        }, 1).unref();
      }

      this.log.debug({
        event: 'get-hit',
        cacheKey,
      });

      this.metrics.hit.inc();

      this.moveToHead(metadata.cacheKey);

      return {
        body: html,
        updatedAt: metadata.mtime,
        headers: response.headers,
        status: response.status,
        source: 'fs',
      };
    } catch (error) {
      this.log.warn({
        event: 'get-error',
        cacheKey,
        error: error as Error,
      });

      // if file is missing or corrupted, remove from cache
      setTimeout(() => {
        this.log.debug({
          event: 'delete-broken',
          cacheKey,
        });

        this.delete(cacheKey);
      }, 1).unref();
    }
  }

  async set(cacheKey: string, cacheEntry: StaticPagesCacheEntry): Promise<void> {
    this.log.debug({
      event: 'set-start',
      cacheKey,
    });

    const [pathname, key] = parseCacheKey(cacheKey);

    const filename = key ? `index.${key}.html` : 'index.html';
    const metaFilename = key ? `index.${key}.json` : 'index.json';
    const filePath = path.join(this.directory, pathname, filename);
    const metaFilePath = path.join(this.directory, pathname, metaFilename);

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      await fs.writeFile(filePath, cacheEntry.body, 'utf-8');
      await fs.writeFile(
        metaFilePath,
        JSON.stringify(
          {
            headers: cacheEntry.headers,
            status: cacheEntry.status,
          },
          null,
          2
        ),
        'utf-8'
      );

      const metadata: FileMetadata = {
        filePath,
        pathname,
        key,
        cacheKey,
        size: Buffer.byteLength(cacheEntry.body, 'utf-8'),
        mtime: cacheEntry.updatedAt,
      };

      this.cache.set(cacheKey, metadata);
      this.moveToHead(metadata.cacheKey);

      this.updateMetrics();

      if (this.cache.size > this.maxSize) {
        setTimeout(() => {
          this.evictTail();
        }, 1).unref();
      }

      this.log.debug({
        event: 'set-success',
        cacheKey,
      });
    } catch (error) {
      this.log.warn({
        event: 'set-error',
        cacheKey,
        error: error as Error,
      });
    }
  }

  has(cacheKey: string): boolean {
    if (!this.cache.has(cacheKey)) {
      return false;
    }

    const metadata = this.cache.get(cacheKey)!;
    const isStale = Date.now() - metadata.mtime > this.ttl;

    if (isStale && !this.allowStale) {
      return false;
    }

    return true;
  }

  async delete(cacheKey: string): Promise<boolean> {
    const metadata = this.cache.get(cacheKey);

    if (!metadata) {
      return false;
    }

    this.log.debug({
      event: 'delete-start',
      filePath: metadata.filePath,
    });

    const node = this.nodes.get(cacheKey)!;

    this.cache.delete(cacheKey);
    this.removeNode(node);

    this.updateMetrics();

    try {
      await fs.unlink(metadata.filePath);
      await fs.unlink(metadata.filePath.replace(/\.html$/, '.json'));

      this.log.debug({
        event: 'delete-success',
        filePath: metadata.filePath,
      });
    } catch (error) {
      this.log.debug({
        event: 'delete-error',
        filePath: metadata.filePath,
        error: error as Error,
      });
    }

    return true;
  }

  async clear(): Promise<void> {
    this.log.debug({
      event: 'clear-start',
    });

    await Promise.allSettled(
      Array.from(this.cache.keys()).map((cacheKey) => {
        return this.limit(() => this.delete(cacheKey));
      })
    );

    this.log.debug({
      event: 'clear-success',
    });

    this.updateMetrics();
  }

  get size(): number {
    return this.cache.size;
  }

  dump(): Array<[key: string, metadata: FileMetadata]> {
    return Array.from(this.cache.entries());
  }

  private async scanDirectory(): Promise<void> {
    try {
      this.log.debug({
        event: 'meta-read-start',
      });
      const meta = await fs.readFile(path.join(this.directory, 'meta.json'), 'utf-8');

      this.staticPages = JSON.parse(meta).staticPages;

      this.log.debug({
        event: 'meta-read-success',
        staticPages: this.staticPages,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'development') {
        this.log.info({
          event: 'meta-read-error',
          error: error as Error,
        });
      }
    }

    const entries = await fs.readdir(this.directory, { withFileTypes: true, recursive: true });
    const promises = [];

    let pages = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html'));

    if (pages.length > this.maxSize) {
      this.log.info({
        event: 'too-many-pages-prerendered',
        pagesCount: pages.length,
      });

      pages = pages.slice(0, this.maxSize);
    }

    for (const entry of pages) {
      const fullPath = path.join(entry.parentPath, entry.name);

      promises.push(this.limit(() => this.addFileToCache(fullPath)));
    }

    await Promise.all(promises);
  }

  private async addFileToCache(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);

      const relativePath = path.relative(this.directory, filePath);
      // foo/index.html -> 'index'
      // foo/index.mobile.html -> 'index.mobile'
      const filename = path.basename(filePath, '.html');
      // index -> ['index', '']
      // index.mobile -> ['index', 'mobile']
      const [, key = ''] = filename.split('.');
      // index.html -> '/'
      // foo/bar/index.html -> '/foo/bar/'
      // foo/bar/index.mobile.html -> '/foo/bar/'
      const pathname = path.join('/', relativePath.replace(path.basename(relativePath), ''), '/');

      const cacheKey = getCacheKey({ pathname, key });

      const metadata: FileMetadata = {
        filePath,
        pathname,
        key,
        cacheKey,
        size: stats.size,
        // TODO: if file already stale on init, what to do?
        mtime: stats.mtimeMs,
      };

      this.cache.set(cacheKey, metadata);
      // order doesn't matter when initializing
      const node = this.list.push(cacheKey);
      this.nodes.set(cacheKey, node);
    } catch (error) {
      this.log.warn({
        event: 'process-file-error',
        filePath,
        error: error as Error,
      });
    }
  }

  moveToHead(cacheKey: string): void {
    if (this.list.start?.value === cacheKey) {
      return;
    }

    const currentNode = this.nodes.get(cacheKey);

    if (currentNode) {
      this.removeNode(currentNode);
    }

    const node = this.list.unshift(cacheKey);
    this.nodes.set(cacheKey, node);
  }

  private removeNode(node: ListNode<string>): void {
    if (this.list.start?.value === node.value) {
      this.list.start = node.next;
    }
    if (this.list.end?.value === node.value) {
      this.list.end = node.prev;
    }

    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }

    this.list.length--;

    this.nodes.delete(node.value);
  }

  private async evictTail(): Promise<void> {
    if (!this.list.end) {
      return;
    }

    const node = this.list.end;
    const cacheKey = node.value;

    this.log.debug({
      event: 'evict',
      cacheKey,
    });

    await this.delete(cacheKey);
  }

  private getTotalBytes(): number {
    let total = 0;

    for (const metadata of this.cache.values()) {
      total += metadata.size;
    }

    return total;
  }

  private updateMetrics(): void {
    this.metrics.size.set(this.cache.size);
    this.metrics.bytes.set(this.getTotalBytes());
  }
}
