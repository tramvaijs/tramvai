import type { ApplicationConfigEntry, ConvertToSchema } from '@tramvai/cli';

export type AppTarget =
  | {
      name: string;
      cwd: string;
      config?: Partial<ConvertToSchema<ApplicationConfigEntry>>;
    }
  | { target: string; cwd: string; name?: string };
