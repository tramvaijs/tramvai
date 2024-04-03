import type { Compiler, MultiCompiler } from 'webpack';
import { WEBPACK_DEBUG_STATS_OPTIONS } from '../../../library/webpack/constants/stats';

export const runWebpack = (
  compiler: Compiler | MultiCompiler,
  options?: { verboseWebpack?: boolean }
) => {
  return new Promise<void>((resolve, reject) => {
    compiler.run((err, stats) => {
      // stats can be undefined when error exists
      const warnings = stats?.toString({
        all: false,
        colors: true,
        warnings: true,
        errors: true,
        ...(options?.verboseWebpack ? WEBPACK_DEBUG_STATS_OPTIONS : {}),
      });

      if (warnings) {
        console.warn(warnings);
      }

      if (err || stats?.hasErrors()) {
        return reject(
          err ||
            new Error(
              stats
                .toJson()
                .errors.map((error: any) => error.message ?? error)
                .join('\n')
            )
        );
      }

      resolve();
    });
  });
};
