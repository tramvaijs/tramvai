import { createToken } from '@tramvai/core';
import type { Registry } from 'prom-client';

export const METRICS_DEFAULT_REGISTRY = createToken<Registry>('metricsDefaultRegistry');
