#!/usr/bin/env node
const Changelog = require('../lib/changelog');
const argv = require('yargs-parser')(
  process.argv.slice(2),
  {
    alias: {
      commitFields: 'f',
      commit: 'c',
      push: 'p',
      version: 'v',
      repository: 'r'
    }
  }
);

new Changelog(argv).generate();
