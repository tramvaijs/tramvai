#!/usr/bin/env node

require('child_process').spawnSync('tramvai', ['new'].concat(process.argv.slice(2)), {
  stdio: 'inherit'
});
