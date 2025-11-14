import { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';

type options = ConstructorParameters<typeof RsdoctorWebpackPlugin<[]>>[0];

export const getRsdoctorOptions = (buildType: 'client' | 'server'): options => ({
  disableClientServer: true,
  features: ['plugins', 'loader'],
  linter: {
    level: 'Ignore',
  },
  output: {
    reportDir: './.rsdoctor',
    mode: 'brief',
    options: {
      type: ['json'],
      jsonOptions: {
        fileName: `${buildType}-rsdoctor-data.json`,
        sections: {
          moduleGraph: false,
          chunkGraph: false,
          rules: false,
        },
      },
    },
  },
});
