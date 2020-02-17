#!/usr/bin/env node

const Release = require('../lib/release');
const argv = require('yargs-parser')(
  process.argv.slice(2),
  {
    alias: {
      dd: 'd',
      gittag: 'gt',
      branch: 'b',
      scripts: ['s', 'step'],
      afterAllScripts: ['e', 'end']
    }
  }
);

new Release(argv);

