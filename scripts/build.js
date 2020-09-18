const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');
const chalk = require('chalk');
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
const {
  ...agrs
} = require('yargs-parser')(process.argv.slice(2));

if (!agrs.pkgs) {
  throw new Error(`'--pkgs' excepted.`);
}

agrs.pkgs.split(',').forEach((pkg) => {
  build(pkg);
});

async function build(pkg) {
  await execa('rollup', ['-c', '--environment', `PACKAGE:${pkg}`], {stdio: 'inherit'});

  const pkgDir = path.resolve(__dirname, '../packages', pkg);
  await createApiExtractor(pkgDir);
}

async function createApiExtractor(pkgDir) {
  const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`)
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath
  )
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true
  })

  if (extractorResult.succeeded) {
    console.log(
      chalk.bold(chalk.green(`API Extractor completed successfully.`))
    )
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
    process.exitCode = 1
  }

  await fs.remove(`${pkgDir}/dist/packages`)
}
