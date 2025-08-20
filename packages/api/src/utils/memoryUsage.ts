export type MemoryStats = {
  maxHeapTotal: number;
  maxHeapUsed: number;
  maxRss: number;
};

/**
 * Creates a memory monitor that tracks maximum memory consumption
 *
 * @param options Configuration options
 * @param options.sampleInterval Interval between memory samples in milliseconds (default: 1000)
 * @returns An object with start and stop methods
 */
export function createMemoryMonitor(options: { sampleInterval?: number } = {}) {
  const { sampleInterval = 1000 } = options;

  let maxHeapTotal = 0;
  let maxHeapUsed = 0;
  let maxRss = 0;
  let intervalId: NodeJS.Timeout | null = null;

  return {
    start() {
      intervalId = setInterval(() => {
        const memoryUsage = process.memoryUsage();

        maxHeapTotal = Math.max(maxHeapTotal, memoryUsage.heapTotal);
        maxHeapUsed = Math.max(maxHeapUsed, memoryUsage.heapUsed);
        maxRss = Math.max(maxRss, memoryUsage.rss);
      }, sampleInterval);

      // Make sure the interval doesn't prevent the process from exiting
      if (intervalId.unref) {
        intervalId.unref();
      }
    },
    read(): MemoryStats {
      // Take one final sample to capture the latest memory usage
      const memoryUsage = process.memoryUsage();

      maxHeapTotal = Math.max(maxHeapTotal, memoryUsage.heapTotal);
      maxHeapUsed = Math.max(maxHeapUsed, memoryUsage.heapUsed);
      maxRss = Math.max(maxRss, memoryUsage.rss);

      return {
        maxHeapTotal,
        maxHeapUsed,
        maxRss,
      };
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
