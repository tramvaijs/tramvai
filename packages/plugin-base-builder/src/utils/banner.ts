import chalk from 'chalk';
import { ConfigService } from '@tramvai/api/lib/config';

import { successBox } from './formatting';
import { getDocUrl, getTip } from './tips';

const label = (name: string) => chalk.bold.cyan(`▸ ${name}:`);
const link = (url: string) => chalk.underline.blue(url);

// eslint-disable-next-line max-statements
export function showBanner(config: ConfigService, options: { transpiler: { name: string } }) {
  const titleLines = [];
  const messageLines = [];

  titleLines.push(`${chalk.yellow.bold('tramvai cli')}\n`);

  // Features
  if (config.projectType !== 'application') {
    titleLines.push(`${label('Type')}             ${config.projectType}`);
  }
  titleLines.push(`${label('ReactRefresh')}     ${config.hotRefresh?.enabled}`);

  if (config.projectType === 'application' && config.fileSystemPages?.enabled) {
    titleLines.push(`${label('FileSystemPages')}  true`);
  }

  // TODO: add information about hosted url !
  const baseServerUrl = `${config.httpProtocol}://${config.host.replace('0.0.0.0', 'localhost')}`;
  const server = `${baseServerUrl}:${config.port}`;

  const staticServer = `${config.httpProtocol}://${config.staticHost.replace(
    '0.0.0.0',
    'localhost'
  )}:${config.staticPort}`;

  if (config.projectType === 'application') {
    // Listeners
    messageLines.push(chalk.bold('Static: ') + link(staticServer));
    if (config.host !== '0.0.0.0' && config.httpProtocol === 'https') {
      messageLines.push(chalk.bold('App:    ') + link(baseServerUrl));
    }
    messageLines.push(chalk.bold('App:    ') + link(server));
  }

  if (config.projectType === 'child-app') {
    messageLines.push(chalk.bold('Base Url: ') + link(`${server}/`));

    messageLines.push(
      chalk.bold('JS:       ') +
        link(
          `${config.projectName}/${config.projectName}_(client|server)@${config.projectVersion}.js`
        )
    );

    messageLines.push(
      chalk.bold('CSS:      ') +
        link(`${config.projectName}/${config.projectName}@${config.projectVersion}.css`)
    );
  }

  const tip = getTip(config, options);

  if (tip) {
    messageLines.push(
      `
${chalk.italic.yellow('Tip of the day:')}

${tip.text}

${chalk.bold.green('Related documentation:')}
${link(`${getDocUrl(tip.docLink)}`)}`
    );
  }

  process.stdout.write(successBox(titleLines, messageLines));
}
