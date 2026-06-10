import type { ConfigService } from '@tramvai/api/lib/config';

export interface TramvaiTip {
  text: string;
  docLink: string;
  isApplicable: (config: ConfigService, options: BannerOptions) => boolean;
}

export interface TramvaiTipUsageInfo {
  lastTimeShowed: number;
  lastTimeShowedByTip: Record<string, number>;
}

export interface BannerOptions {
  transpiler: { name: string };
}
