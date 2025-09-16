const util = require('util');
const childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);

const publicPackages = require('./public-packages-list');

async function publishPublicPackages() {
  const paths = publicPackages.map((packageName) =>
    require.resolve(`${packageName}/package.json`).replace('/package.json', '')
  );

  let publicationFailed = false;

  for (let i = 0; i < paths.length; i++) {
    const pkgPath = paths[i];
    let channel;

    try {
      channel = await exec(
        `npm publish --access public --tag latest --registry https://registry.npmjs.org/`,
        {
          cwd: pkgPath,
        }
      );
    } catch (e) {
      console.log('npm publish error', e);
      publicationFailed = true;
    }
    if (channel && channel.stderr) {
      console.log('npm publish problem', channel.stderr);
    }
    if (channel && channel.stdout) {
      console.log('npm publish finish', channel.stdout);
    }
  }

  if (publicationFailed) {
    process.exit(1);
  }
}

publishPublicPackages();
