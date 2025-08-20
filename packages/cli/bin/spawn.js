const { spawn: cpSpawn } = require('child_process');
const exit = require('exit');

const args = process.argv.slice(2);
const maxMemory = process.env.MAX_USED_MEMORY || '3000';
const maxSemiSpaceSize = process.env.MAX_SEMI_SPACE_SIZE || '128';
const debugBuild = process.env.TRAMVAI_DEBUG_BUILD;
const defaultArgs = [
  `--max-old-space-size=${maxMemory}`,
  `--max-semi-space-size=${maxSemiSpaceSize}`,
  getDebugOption(debugBuild),
].filter(Boolean);

const paramsIndex = args.findIndex((x) => !x.startsWith('-'));
const nodeArgs = paramsIndex > 0 ? args.slice(0, paramsIndex) : [];

module.exports = function spawn(executePath) {
  const controller = new AbortController();
  const { signal } = controller;
  let isAborted = false;

  const cliInstance = cpSpawn(
    'node',
    defaultArgs
      .concat(nodeArgs)
      .concat(require.resolve(executePath))
      .concat(args.slice(paramsIndex > 0 ? paramsIndex : 0)),
    // this is the first place where we can pass env which will be used by webpack
    // about watchpack issue - https://github.com/webpack/watchpack/issues/222, https://github.com/vercel/next.js/pull/51826
    { stdio: 'inherit', env: { ...process.env, WATCHPACK_WATCHER_LIMIT: '20' }, signal }
  );

  cliInstance.on('error', async (err) => {
    if (err.code !== 'ABORT_ERR') {
      console.log(err);
      console.warn(`Process was exited with code "${err.code}"
It's unexpected, please check available/used memory and cpu while running last command`);

      await sendAnalytics(err);

      exit(1);
    } else {
      console.warn('Child process aborted!');
      isAborted = true;
    }
  });

  cliInstance.on('exit', async (code, sig) => {
    if (sig) {
      console.warn(`Process was exited with signal "${sig}"
It's unexpected, please check available/used memory and cpu while running last command`);

      await sendAnalytics(new Error(`Process exited with signal: ${sig}`));

      exit(1);
    } else if (!isAborted) {
      exit(code);
    } else {
      isAborted = false;
    }
  });

  return controller;
};

function getDebugOption(debugType) {
  if (debugType === 'wait') {
    return '--inspect-wait';
  }

  if (debugType === 'break') {
    return '--inspect-brk';
  }

  if (debugType) {
    return '--inspect';
  }
}

async function sendAnalytics(error) {
  const endpoint =
    process.env.TRAMVAI_ANALYTICS_ENDPOINT ?? '';

  if (
    !endpoint ||
    process.env.TRAMVAI_ANALYTICS_DISABLED === 'true' ||
    process.env.TRAMVAI_ANALYTICS_DRY_RUN === 'true'
  ) {
    return;
  }

  try {
    if (error instanceof Error) {
      Object.defineProperties(error, {
        message: {
          configurable: true,
          enumerable: true,
          writable: true,
        },
        stack: {
          configurable: true,
          enumerable: true,
          // stack is getter
        },
      });
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          system: process.env.TRAMVAI_ANALYTICS_SYSTEM ?? 'tramvai-cli',
          event: 'cli:spawn:error',
          message: '@tramvai/cli process spawn error',
          arguments: process.argv.slice(2),
          vcs: {
            tenant: process.env.CI_PROJECT_NAMESPACE,
            repository: process.env.CI_PROJECT_NAME,
            pipelineUrl: process.env.CI_PIPELINE_URL,
            jobUrl: process.env.CI_JOB_URL,
          },
          error,
        },
      ]),
    });
  } catch (e) {
    // do nothing
  }
}
