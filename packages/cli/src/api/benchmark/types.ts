export interface Stats {
  samples: number[];
  mean: number;
  std: number;

  variance: number;
}

export type Samples = {
  clientSamples: Stats['samples'];
  serverSamples: Stats['samples'];
  maxMemoryRssSamples: Stats['samples'];
};

export type RunStats = {
  client: Stats;
  server: Stats;
  maxMemoryRss: Stats;
};
