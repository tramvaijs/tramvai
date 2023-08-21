import type { Compiler, MultiCompiler } from 'webpack';

const warnFilter = (warning: string) => {
  // this library is not suited for bundling for Node.js environment https://github.com/browserslist/browserslist/issues/199
  // but we don't have any issues with it
  if (
    warning.includes('node_modules/browserslist/node.js') &&
    warning.includes('Critical dependency')
  ) {
    return false;
  }
  // always trigger to platform.js and react.js chunks, looks like a noise
  if (warning.includes('combined asset size exceeds the recommended limit')) {
    return false;
  }
  // https://github.com/webpack/webpack/pull/11646 not works for warnings
  if (
    warning.includes('not found') &&
    (warning.includes('dependenciesVersion.js') || warning.includes('@/__private__/'))
  ) {
    return false;
  }
  return warning;
};

export const runWebpack = (compiler: Compiler | MultiCompiler) => {
  return new Promise<void>((resolve, reject) => {
    compiler.run((err, stats) => {
      // stats can be undefined when error exists
      let warnings = stats?.toString({
        all: false,
        colors: true,
        warnings: true,
        errors: true,
      });

      if (warnings) {
        warnings = warnings.split('WARNING').filter(warnFilter).join('WARNING');
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
