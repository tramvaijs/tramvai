#!/usr/bin/env node

process.title = 'tramvai';

const path = require('node:path');
const chokidar = require('chokidar');
const chalk = require('chalk');

let abortController;

function run() {
  return require('./spawn')('../lib/cli/bin-init');
}

abortController = run();

const watchedFileName = 'tramvai.json';
function onConfigChange() {
  console.log(chalk.yellow(`${watchedFileName} changed, restart process...`));

  abortController.abort();
  abortController = run();
}

try {
  const tramvaiJsonPath = path.resolve(process.cwd(), watchedFileName);
  chokidar.watch(tramvaiJsonPath).on('change', onConfigChange);
} catch (err) {
  console.error(`Something went wrong while watching for changes in ${watchedFileName}: ${err}`);
}
