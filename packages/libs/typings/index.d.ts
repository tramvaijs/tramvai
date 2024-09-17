declare interface Performance {
  // old browsers can return null or undefined
  // https://caniuse.com/mdn-api_performance_measure_returns_performancemeasure
  measure(
    measureName: string,
    startOrMeasureOptions?: string | PerformanceMeasureOptions,
    endMark?: string
  ): PerformanceMeasure | undefined | null;
}
