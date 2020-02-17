const archiver = require('archiver');
const log = require('./log');
const fse = require('fs-extra');
const { joinHome } = require('./_util');

function create({
  from,
  rootDir = false,
  filepath,
  level = 7
} = {}) {
  return new Promise((rs, rj) => {
    if (!from) {
      return log.error('input folder excepted.', 'zip');
    }
    const date = new Date();
    filepath = filepath || joinHome(`archiver.${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.gz`);
    const output = fse.createWriteStream(filepath);
    output.on('close', function() {
      rs(filepath);
    });
    try {
      const archive = archiver('zip', {
        zlib: { level }
      });
      archive.directory(from, rootDir);
      archive.pipe(output);
      archive.finalize();
    } catch (e) {
      console.log(e);
      rj(e);
    }
  });
}
module.exports = {
  create,
}