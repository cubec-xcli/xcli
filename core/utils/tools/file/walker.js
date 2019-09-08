const fs = require('fs');
const path = require('path');

// 查找目录下所有的文件
// 不包括目录，纯文件
const filewalker = function(dir, done) {
  let results = [];

  fs.readdir(dir, function(err, list) {
    if (err) return done(err);

    let pending = list.length;

    if (!pending) return done(results);

    list.forEach(function(file) {

      file = path.resolve(dir, file);

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {

          filewalker(file, function(err, res) {
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

module.exports = filewalker;
