const fs = require('fs');
const util = require('util');
const path = require('path');
const struct = require('ax-struct-js');

const map = struct.map();
const isFn = struct.type('func');

const fsreaddir = util.promisify(fs.readdir);
const fsstat = util.promisify(fs.stat);

// 查找目录下所有的文件
// 不包括目录，纯文件
const filewalker = async function(dir) {
  let results = [];

  const dirs = await fsreaddir(dir);

  if(!dirs || !dirs.length) return false;

  const childWalker = map(dirs, async function(file){
    const filePath = path.resolve(dir, file);
    const stats = await fsstat(filePath);

    if(stats && stats.isDirectory()){
      const childResults = await filewalker(filePath);
      return childResults;
    }

    return [filePath];
  });

  const getChildFiles = await Promise.all(childWalker);

  results = results.concat.apply(results, getChildFiles);

  return results;
};

const syncFilewalker = function(dir, done) {
  let results = [];

  fs.readdir(dir, function(err, list) {
    if (err) return done(err);

    let pending = list.length;

    if (!pending) return done(results);

    list.forEach(function(file) {

      file = path.resolve(dir, file);

      fs.stat(file, function(err, stat) {
        if(err) return done(err);

        if (stat && stat.isDirectory()) {

          syncFilewalker(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(results);
          });

        } else {

          results.push(file);
          if (!--pending) done(results);

        }

      });

    });

  });
};

module.exports = function(dir, done){
  if(done && isFn(done))
    return syncFilewalker(dir, done);

  return filewalker(dir);
};
